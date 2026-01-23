import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, UseGuards } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Observable, from, of, switchMap, take,forkJoin,map } from 'rxjs';
import { AuthService } from 'src/auth/auth.service';
import { ConversationService } from 'src/messagerie/services/conversation.service';
import { User } from 'src/user/entities/user.entity';
import { MessageEntity } from 'src/messagerie/models/message.entity';
import { ActiveConversationEntity } from 'src/messagerie/models/active-conversation.entity';
import { firstValueFrom } from 'rxjs';

@WebSocketGateway({
  namespace: '/messagerie',
  cors: {
    // Si la variable FRONTEND_URL existe (Prod), on l'utilise. Sinon localhost:4200 (Dev).
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  },
})
@Injectable()
export class MessagerieGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private authService: AuthService,
    private conversationService: ConversationService,
  ) {}

  private onlineUsers = new Map<string, { user: User; socketIds: Set<string> }>();
  @WebSocketServer()
  server: Server;

  async handleConnection(socket: Socket) {
    console.log('🔌 Connection attempt:', socket.id);
    
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
    
if (!token) {
      console.log('No token provided');
      socket.disconnect();
      return;
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const user = await this.authService.loginOrCreateUser(decodedToken);
      
      if (!user) {
        console.log('User not found/created');
        socket.disconnect();
        return;
      }

      socket.data.user = user;
      
      // Mettre à jour la liste des utilisateurs en ligne
      if (!this.onlineUsers.has(user.id)) {
        this.onlineUsers.set(user.id, { user, socketIds: new Set([socket.id]) });
      } else {
        this.onlineUsers.get(user.id)?.socketIds.add(socket.id);
      }

      // Diffuser la mise à jour de présence
      this.broadcastPresence();

      this.getConversations(socket, user.id);
      console.log(`✅ User connected: ${user.email}`);
    } catch (error) {
      console.error('Authentication error:', error);
      socket.disconnect();
    }
  }

  getConversations(socket: Socket, userId: string): void {
    this.conversationService
      .getConversationsWithUsers(userId)
      .pipe(take(1))
      .subscribe((conversations) => {
        this.server.to(socket.id).emit('conversations', conversations);
      });
  }

  handleDisconnect(socket: Socket) {
    console.log('❌ User disconnected:', socket.id);
    const user = socket.data.user;
    
    if (user) {
      const userData = this.onlineUsers.get(user.id);
      if (userData) {
        userData.socketIds.delete(socket.id);
        if (userData.socketIds.size === 0) {
          this.onlineUsers.delete(user.id);
        }
        // Diffuser la mise à jour de présence
        this.broadcastPresence();
      }
    }

    this.conversationService
      .leaveConversation(socket.id)
      .pipe(take(1))
      .subscribe();
  }

private broadcastPresence() {
  // Envoyer la liste complète des utilisateurs en ligne à tout le monde
  const onlineUsers = Array.from(this.onlineUsers.values()).map(u => u.user);
  this.server.emit('presenceUpdate', onlineUsers);
}

@SubscribeMessage('getOnlineUsers')
handleGetOnlineUsers(socket: Socket) {
  const onlineUsers = Array.from(this.onlineUsers.values()).map(u => u.user);
  socket.emit('onlineUsers', onlineUsers);
}

@SubscribeMessage('getUnreadCounts')
handleGetUnreadCounts(socket: Socket) {
  const { user } = socket.data;
  if (!user) return;

  this.conversationService.getUnreadCounts(user.id)
    .pipe(take(1))
    .subscribe(counts => {
      socket.emit('unreadCounts', counts);
    });
}

private async checkAndNotifyUnreadMessages(userId: string) {
  const counts = await firstValueFrom(
    this.conversationService.getUnreadCounts(userId).pipe(take(1))
  );
  
  const userData = this.onlineUsers.get(userId);
  if (userData) {
    userData.socketIds.forEach(socketId => {
      this.server.to(socketId).emit('unreadCounts', counts);
    });
  }
}

@SubscribeMessage('sendMessage')
handleMessage(socket: Socket, newMessage: MessageEntity) {
  if (!newMessage.conversation) return of(null);

  const { user } = socket.data;
  newMessage.user = user;

  const messageEntity = new MessageEntity();
  messageEntity.message = newMessage.message;
  messageEntity.image = newMessage.image;
  messageEntity.user = user;
  messageEntity.conversation = newMessage.conversation;

  this.conversationService
    .createMessage(messageEntity)
    .pipe(
      switchMap((message: MessageEntity) => {
        // Vérifier si le destinataire est actif dans la conversation
        return this.conversationService.getActiveUsers(message.conversation.id).pipe(
          switchMap((activeUsers: ActiveConversationEntity[]) => {
            const recipientActive = activeUsers.some(u => u.userId !== user.id);

            // Mettre à jour le statut delivered immédiatement si le destinataire est actif
            const update$ = recipientActive 
              ? this.conversationService.markMessagesAsDelivered(message.conversation.id, user.id)
              : of(null);

            return forkJoin([update$, of({message, activeUsers})]);
          }),
          map(([_, result]) => result)
        );
      }),
      take(1)
    )
    .subscribe(({message, activeUsers}) => {
      const messageToSend = {
        ...message,
        user: socket.data.user,
        delivered: activeUsers.some(u => u.userId !== user.id) // Marqué comme livré si le destinataire est actif
      };
      
      // Envoyer le message à tous les utilisateurs actifs
      activeUsers.forEach((activeConversation: ActiveConversationEntity) => {
        this.server
          .to(activeConversation.socketId)
          .emit('newMessage', messageToSend);
      });

      this.conversationService.getUsersInConversation(message.conversation.id)
      .pipe(take(1))
      .subscribe(conversations => {
        conversations[0]?.users.forEach(user => {
          if (user.id !== socket.data.user.id) {
            this.checkAndNotifyUnreadMessages(user.id);
          }
        });
      });

      // Si le destinataire n'est pas actif, envoyer une notification push ou autre
    });
}



@SubscribeMessage('createConversation')
createConversation(socket: Socket, friend: User) {
  this.conversationService
    .createConversation(socket.data.user, friend)
    .pipe(take(1))
    .subscribe((conversation) => {
      this.server.emit('conversationCreated', conversation);
      this.getConversations(socket, socket.data.user.id);
    });
}

@SubscribeMessage('joinConversation')
joinConversation(socket: Socket, conversationId: string) {
  const { user } = socket.data;
  
  this.conversationService
    .joinConversation(conversationId, user.id, socket.id)
    .pipe(
      switchMap((activeConversation: ActiveConversationEntity) => {
        if (!activeConversation) return of(null);
        
        // Marquer les messages comme livrés ET comme lus
        return forkJoin([
          this.conversationService.markMessagesAsDelivered(conversationId, user.id),
          this.conversationService.markMessagesAsRead(conversationId, user.id),
          this.conversationService.getMessages(conversationId)
        ]);
      }),
      take(1)
    )
    .subscribe(([_, __, messages]: [void, void, MessageEntity[]]) => {
      if (messages) {
        this.server.to(socket.id).emit('messages', messages);
      }
    });
}

// Dans handleMarkAsRead du gateway
@SubscribeMessage('markAsRead')
handleMarkAsRead(socket: Socket, conversationId: string) {
  const { user } = socket.data;
  
  this.conversationService.markMessagesAsRead(conversationId, user.id)
    .pipe(
      switchMap(() => this.conversationService.getMessages(conversationId)),
      take(1)
    )
    .subscribe((messages: MessageEntity[]) => {
      // Diffuser les messages mis à jour à tous les participants
      this.conversationService.getActiveUsers(conversationId)
        .pipe(take(1))
        .subscribe(activeUsers => {
          activeUsers.forEach(activeUser => {
            this.server.to(activeUser.socketId).emit('messagesUpdated', {
              conversationId,
              messages: messages.map(msg => ({
                ...msg,
                // Mettre à jour les états read/delivered pour l'utilisateur courant
                read: msg.user.id !== user.id ? msg.read : true,
                delivered: msg.user.id !== user.id ? msg.delivered : true
              }))
            });
          });
        });
        this.checkAndNotifyUnreadMessages(user.id);
    });
}
  @SubscribeMessage('leaveConversation')
  leaveConversation(socket: Socket) {
    this.conversationService
      .leaveConversation(socket.id)
      .pipe(take(1))
      .subscribe();
  }
}