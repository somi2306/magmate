import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, fromEvent } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../auth/auth.service';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface User {
  id: string;
  email: string;
  fname: string;
  lname: string;
  photo: string | null;
  role: string;
  registrationDate: string;
}

export interface Message {
  id?: string;
  message: string;
  user: User;
  conversation: Conversation;
  createdAt?: Date;
  image?: string;
  delivered?: boolean;
  read?: boolean;
}

export interface Conversation {
  id?: string;
  users: User[];
  createdAt?: Date;
  lastMessage?: Message;
}

export interface ActiveConversation {
  id?: string;
  socketId: string;
  userId: string;
  conversationId: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessagerieService {
  private socket!: Socket; 
  private onlineUsers: User[] = [];
  
  constructor(private http: HttpClient, private authService: AuthService) {} 

  async connect(): Promise<void> {
    try {
      //console.log('⏳ Tentative de récupération du token...');
      const token = await this.authService.getIdToken();
      
      if (!token) {
        console.error('🔴 Aucun token disponible');
        throw new Error('No token available');
      }

      //console.log('🟢 Token récupéré avec succès:', token);
      
      const socketUrl = environment.apiUrl.replace('/api', '') + '/messagerie';

      this.socket = io(socketUrl, {
        auth: { token },
        transports: ['websocket']
      });

      //console.log('⏳ Tentative de connexion WebSocket vers:', socketUrl);

      return new Promise<void>((resolve, reject) => {
        this.socket.on('connect', () => {
          //console.log('✅ WebSocket connecté. ID:', this.socket.id);
          resolve();
        });

        this.socket.on('connect_error', (err) => {
          console.error(' Erreur de connexion WebSocket:', err);
          reject(err);
        });
      });
    } catch (err) {
      console.error('💥 Erreur lors de la connexion:', err);
      throw err;
    }
  }

  sendMessage(message: Message): void {
    if (!this.socket) throw new Error('Socket not connected');
      const messageToSend = {
    ...message,
    delivered: false,
    read: false
  };
    this.socket.emit('sendMessage', message);
  }

  getUnreadCounts(): Observable<{ [conversationId: string]: number }> {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('getUnreadCounts');
    return fromEvent<{ [conversationId: string]: number }>(this.socket, 'unreadCounts');
  }

  requestUnreadCounts(): void {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('getUnreadCounts');
  }

  getMessagesUpdates(): Observable<{conversationId: string, messages: Message[]}> {
    if (!this.socket) throw new Error('Socket not connected');
    return fromEvent(this.socket, 'messagesUpdated');
  }

  getNewMessages(): Observable<Message> {
    if (!this.socket) throw new Error('Socket not connected');
    return fromEvent<Message>(this.socket, 'newMessage').pipe(
      tap((message: Message) => {
        if (message.id) {
          this.updateMessageStatus(message.id, { 
            delivered: message.delivered ?? false, 
            read: message.read ?? false 
          });
        }
      })
    );
  }

  getMessageStatusUpdates(): Observable<{messageId: string, status: {delivered: boolean, read: boolean}}> {
    if (!this.socket) throw new Error('Socket not connected');
    return fromEvent(this.socket, 'messageStatusUpdated');
  }

  updateMessageStatus(messageId: string, status: {delivered: boolean, read: boolean}): void {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('updateMessageStatus', {messageId, status});
  }

  getConversationMessages(conversationId: string): Observable<Message[]> {
    if (!this.socket) throw new Error('Socket not connected');
    
    return new Observable<Message[]>(observer => {
      const listener = (messages: Message[]) => {
        if (Array.isArray(messages)) {
          observer.next(messages);
          observer.complete();
        }
      };
      
      this.socket.once('messages', listener);
      this.socket.emit('getMessages', conversationId);
      
      return () => {
        this.socket.off('messages', listener);
      };
    });
  }

  getConversations(): Observable<Conversation[]> {
    if (!this.socket) throw new Error('Socket not connected');
    return fromEvent(this.socket, 'conversations');
  }

  getMessages(): Observable<Message[]> {
    if (!this.socket) throw new Error('Socket not connected');
    return fromEvent(this.socket, 'messages');
  }

  createConversation(friend: User): Observable<Conversation> {
    if (!this.socket) throw new Error('Socket not connected');
    
    return new Observable<Conversation>(observer => {
      const listener = (newConversation: Conversation) => {
        observer.next(newConversation);
        observer.complete();
        this.socket.off('conversationCreated', listener); 
      };
      
      this.socket.on('conversationCreated', listener);
      this.socket.emit('createConversation', friend);
      
      return () => {
        this.socket.off('conversationCreated', listener);
      };
    });
  }

  joinConversation(conversationId: string): void {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('joinConversation', conversationId);
  }

  leaveConversation(): void {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('leaveConversation');
  }

  uploadImage(file: File, conversationId: string, userId: string): Observable<Message> {
    if (!this.socket) throw new Error('Socket not connected');
    
    return new Observable<Message>(observer => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        const message: Message = {
          message: '[IMAGE]',
          image: imageData,
          user: { id: userId } as User,
          conversation: { id: conversationId } as Conversation,
          createdAt: new Date()
        };
        
        this.socket.emit('sendMessage', message);
        observer.next(message);
        observer.complete();
      };
      reader.readAsDataURL(file);
    });
  }

  getPresenceUpdates(): Observable<User[]> {
    if (!this.socket) throw new Error('Socket not connected');
    return fromEvent<User[]>(this.socket, 'presenceUpdate').pipe(
      tap((users: User[]) => this.onlineUsers = users)
    );
  }

  getOnlineUsers(): Observable<User[]> {
    if (!this.socket) throw new Error('Socket not connected');
    return fromEvent<User[]>(this.socket, 'onlineUsers').pipe(
      tap((users: User[]) => this.onlineUsers = users)
    );
  }

  requestOnlineUsers(): void {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('getOnlineUsers');
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.some(user => user.id === userId);
  }

  markAsRead(conversationId: string): void {
    if (!this.socket) throw new Error('Socket not connected');
    this.socket.emit('markAsRead', conversationId);
  }

  getMessagesReadUpdates(): Observable<{conversationId: string, readerId: string}> {
    if (!this.socket) throw new Error('Socket not connected');
    return fromEvent(this.socket, 'messagesRead');
  }

  getMyFriends(userId: string): Observable<User[]> {
    //   ICI : Utilisation de environment.apiUrl
    return this.http.post<User[]>(
      `${environment.apiUrl}/user/friends/my`,
      { userId }
    );
  }
}