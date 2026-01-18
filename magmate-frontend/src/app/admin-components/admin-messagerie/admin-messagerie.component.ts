import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Observable, Subscription, firstValueFrom } from 'rxjs';
import { MessagerieService, User, Message, Conversation } from '../../components/messagerie/services/messagerie.service';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { DomSanitizer } from '@angular/platform-browser';
import { Pipe, PipeTransform } from '@angular/core';
import twemoji from 'twemoji';
import { InitialPipe } from '../../app.module'; // Make sure path is correct
import { InitialsPipe } from '../../app.module'; // Make sure path is correct
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admin-messagerie',
  standalone: true,
  imports: [CommonModule, FormsModule,PickerModule,PickerComponent],
  templateUrl: './admin-messagerie.component.html',
  styleUrl: './admin-messagerie.component.css'
})
export class AdminMessagerieComponent implements OnInit, OnDestroy{
 @ViewChild('messageForm') messageForm!: NgForm;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  currentUserId: string | null = null;
  friends: User[] = [];
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  newMessage = '';
  isLoading = true;
  error: string | null = null;
  isConnected = false;
  onlineUsers = new Set<string>();
  private subscriptions = new Subscription();
  private _totalUnreadCount = 0;
  private routeSubscription: Subscription | undefined;
unreadCounts: { [conversationId: string]: number } = {};
  constructor(
    private messagerieService: MessagerieService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
        private route: ActivatedRoute, // Ajoutez cette ligne
    private router: Router // Ajoutez cette ligne
  ) {}

  async ngOnInit() {
    try {
      this.currentUserId = await this.authService.getUserIdByToken();
      if (!this.currentUserId) throw new Error("Utilisateur non trouvé");

      await this.messagerieService.connect();
      this.isConnected = true;

      this.setupListeners();
      this.setupPresenceListeners();

      await this.loadFriends();
      await this.loadConversations();

      // Gérer le paramètre recipientId
      this.routeSubscription = this.route.queryParams.subscribe(async params => {
        if (params['recipientId']) {
          await this.handleRecipientParam(params['recipientId']);
        }
      });
    } catch (err: any) {
      this.error = err.message;
      console.error('Initialisation erreur:', err);
    } finally {
      this.isLoading = false;
    }
  }

  private async handleRecipientParam(recipientId: string) {
    try {
      // Vérifier si une conversation existe déjà avec ce destinataire
      const existingConv = this.conversations.find(conv => 
        conv.users.some(user => user.id === recipientId)
      );

      if (existingConv) {
        // Si une conversation existe, la sélectionner
        await this.selectConversation(existingConv);
      } else {
        // Sinon, créer une nouvelle conversation
        const recipient = this.friends.find(f => f.id === recipientId);
        if (recipient) {
          await this.startNewConversation(recipient);
        } else {
          console.warn('Destinataire non trouvé dans la liste d\'amis');
        }
      }

      // Nettoyer les queryParams après traitement
      this.router.navigate([], {
        queryParams: { recipientId: null },
        queryParamsHandling: 'merge'
      });
    } catch (err) {
      console.error('Erreur lors du traitement du destinataire:', err);
    }
  }

private setupPresenceListeners() {
  this.subscriptions.add(
    this.messagerieService.getPresenceUpdates().subscribe({
      next: (users: User[]) => {
        this.onlineUsers = new Set(users.map(user => user.id)); // <-- Mise à jour ici
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur présence:', err)
    })
  );

  this.messagerieService.requestOnlineUsers();
}

  // Mettre à jour la méthode isOnline
isOnline(conversation: Conversation): boolean {
  if (!conversation?.users || !this.currentUserId) return false;
  return conversation.users.some(user => 
    user.id !== this.currentUserId && this.onlineUsers.has(user.id)
  );
}
isUserInConversation(conversationId: string): boolean {
  return this.selectedConversation?.id === conversationId;
}

  private setupListeners() {
    // Écoute des nouveaux messages
// Dans setupListeners(), modifiez la partie getNewMessages()
this.subscriptions.add(
  this.messagerieService.getNewMessages().subscribe({
    next: (message: Message) => {
      if (this.selectedConversation?.id === message.conversation.id) {
        if (!this.messages.some(m => m.id === message.id)) {
          // Pour nos propres messages, garder read:false initialement
          if (message.user.id === this.currentUserId) {
            message.read = false;
            message.delivered = false;
          }
          this.messages.push(message);
          this.scrollToBottom();
        }
      }
    },
    error: (err) => console.error('Erreur nouveaux messages:', err)
  })
);

    // Écoute des conversations
    this.subscriptions.add(
      this.messagerieService.getConversations().subscribe({
        next: (conversations: Conversation[]) => {
          this.conversations = conversations;
          this.updateLastMessages();
        },
        error: (err) => console.error('Erreur conversations:', err)
      })
    );

    // Écoute des messages
    this.subscriptions.add(
      this.messagerieService.getMessages().subscribe({
        next: (messages: Message[]) => {
          this.messages = messages;
          this.scrollToBottom();
        },
        error: (err) => console.error('Erreur messages:', err)
      })
    );

this.subscriptions.add(
  this.messagerieService.getMessagesUpdates().subscribe({
    next: ({ conversationId, messages }) => {
if (this.selectedConversation?.id === conversationId) {
  const existingMessagesMap = new Map(this.messages.map(m => [m.id, m]));

  let hasUpdates = false;

  for (const updatedMsg of messages) {
    const existingMsg = existingMessagesMap.get(updatedMsg.id);
    if (existingMsg) {
      if (
        existingMsg.read !== updatedMsg.read ||
        existingMsg.delivered !== updatedMsg.delivered
      ) {
        existingMsg.read = updatedMsg.read;
        existingMsg.delivered = updatedMsg.delivered;
        hasUpdates = true;
      }
    } else {
      // Nouveau message qu'on n'a pas encore → on ajoute
      this.messages.push(updatedMsg);
      hasUpdates = true;
    }
  }

if (hasUpdates) {
  this.messages.sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());

  requestAnimationFrame(() => {
    this.cdr.detectChanges();
    this.scrollToBottom();
  });
}

}

    },
    error: (err) => console.error('Erreur mise à jour messages:', err)
  })
);
/*
    this.subscriptions.add(
    this.messagerieService.getMessagesUpdates().subscribe({
      next: ({conversationId, messages}) => {
        if (this.selectedConversation?.id === conversationId) {
          this.messages = messages;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Erreur mise à jour messages:', err)
    })
  );
*/
    this.subscriptions.add(
    this.messagerieService.getUnreadCounts().subscribe({
      next: (counts: { [conversationId: string]: number }) => {
        this.unreadCounts = counts;
              this._totalUnreadCount = Object.values(counts).reduce((total, count) => total + count, 0);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur compteurs non lus:', err)
    })
  );

  // Demander les compteurs initiaux après la connexion
  setTimeout(() => {
    this.messagerieService.requestUnreadCounts();
  }, 1000);
  }

onMessagesVisible() {
  if (this.selectedConversation) {
    // Marquer comme lus seulement les messages reçus
    const unreadReceivedMessages = this.messages.filter(
      m => m.user.id !== this.currentUserId && !m.read
    );
    
    if (unreadReceivedMessages.length > 0) {
      this.messagerieService.markAsRead(this.selectedConversation.id!);
    }
  }
}
  private async loadFriends() {
    try {
      if (!this.currentUserId) return;
      this.friends = await firstValueFrom(
        this.messagerieService.getMyFriends(this.currentUserId)
      );
    } catch (err) {
      console.error('Erreur chargement amis:', err);
    }
  }

  private async loadConversations() {
    // Les conversations sont chargées via l'écouteur getConversations()
  }

  private updateLastMessages() {
    this.conversations.forEach(conv => {
      if (conv.id === this.selectedConversation?.id) {
        this.selectedConversation = conv;
      }
    });
  }

  private currentConversationId: string | null = null;

async selectConversation(conversation: Conversation) {
  if (this.selectedConversation?.id === conversation.id) return;

  if (this.selectedConversation) {
    this.messagerieService.leaveConversation();
  }

  this.selectedConversation = conversation;
  this.messages = [];
  
  // Réinitialiser le compteur pour cette conversation
  delete this.unreadCounts[conversation.id!];
  this.messagerieService.requestUnreadCounts();

  try {
    this.messagerieService.joinConversation(conversation.id!);
    
    const messages = await firstValueFrom(
      this.messagerieService.getConversationMessages(conversation.id!)
    );
    
    this.messages = messages;
    this.scrollToBottom();
    
    // Ne pas marquer automatiquement comme lus ici
    // La méthode onMessagesVisible s'en chargera quand l'utilisateur verra réellement les messages
  } catch (err) {
    console.error('Error selecting conversation:', err);
    this.error = 'Failed to load conversation';
  }
}

// Modifiez startNewConversation
async startNewConversation(friend: User) {
  try {
    const newConv = await firstValueFrom(
      this.messagerieService.createConversation(friend)
    );
    this.selectConversation(newConv);
  } catch (err) {
    console.error('Error creating conversation:', err);
    this.error = 'Failed to create conversation';
  }
}



sendMessage() {
  if (!this.newMessage.trim() || !this.selectedConversation) return;

  const message: Message = {
    message: this.newMessage,
    user: { id: this.currentUserId! } as User,
    conversation: this.selectedConversation,
    createdAt: new Date()
  };

  this.newMessage = '';
  this.scrollToBottom();
  this.messagerieService.sendMessage(message);
}


  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
          
      } catch (err) {
        console.error('Erreur scroll:', err);
      }
    }, 100);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.routeSubscription?.unsubscribe();
    this.messagerieService.leaveConversation();
  }

  // Dans MessagerieComponent

// Obtenir l'image d'une conversation (premier utilisateur autre que current)
getConversationImage(conversation: Conversation): string | null {
  if (!conversation?.users) return null;
  const otherUser = conversation.users.find(u => u.id !== this.currentUserId);
  return otherUser?.photo || null;
}

// Obtenir le nom d'une conversation
getConversationName(conversation: Conversation): string {
  if (!conversation?.users) return 'Conversation';
  const otherUsers = conversation.users.filter(u => u.id !== this.currentUserId);
  return otherUsers.map(u => `${u.fname} ${u.lname}`).join(', ');
}

// Obtenir l'image d'un utilisateur
getUserImage(user: User): string | null {
  return user?.photo || null;
}

// Vérifier si un utilisateur est en ligne (à implémenter)


// Ajoutez cette variable à votre classe
showEmojiPicker = false;

// Ajoutez cette méthode pour gérer la sélection d'emojis
addEmoji(event: any) {
  if (event && event.emoji && event.emoji.native) {
    this.newMessage += event.emoji.native;
    this.showEmojiPicker = false;
    this.cdr.detectChanges();
  }
}


toggleEmojiPicker() {
  this.showEmojiPicker = !this.showEmojiPicker;
}

/* getSafeMessage(content: string) {
  return this.sanitizer.bypassSecurityTrustHtml(
    twemoji.parse(content, {
      base: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/',
      folder: '72x72',
      ext: '.png'
    })
  );
} */
getSafeMessage(content: string) {
  return this.sanitizer.bypassSecurityTrustHtml(
    twemoji.parse(content, {
      base: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/',
      folder: 'svg',
      ext: '.svg',
      size: 'svg',
      attributes: () => ({ 
        class: 'emoji',
        style: 'height: 20px; width: 20px; vertical-align: middle; margin: 0 2px;' 
      })
    })
  );
}

// Ajoutez cette méthode
@ViewChild('fileInput') fileInput!: ElementRef;

async onFileSelected(event: any) {
  const file = event.target.files[0];
  if (!file || !this.selectedConversation || !this.currentUserId) return;

  // Vérification de la taille (ex: 5MB max)
  if (file.size > 5 * 1024 * 1024) {
    this.error = 'La taille du fichier ne doit pas dépasser 5MB';
    return;
  }

  try {
    await firstValueFrom(
      this.messagerieService.uploadImage(
        file, 
        this.selectedConversation.id!,
        this.currentUserId
      )
    );
    // Réinitialiser l'input file après l'envoi
    this.fileInput.nativeElement.value = '';
  } catch (err) {
    console.error('Erreur envoi image:', err);
    this.error = 'Échec de l\'envoi de l\'image';
    this.fileInput.nativeElement.value = '';
  }
}
getMessageStatus(message: Message): string {
  if (!message) return '';
  
  if (message.read) return '✓✓ Lu';
  if (message.delivered) return '✓✓ Livré';
  return '✓ Envoyé';
}


getUnreadCount(conversationId: string): number {
  return this.unreadCounts[conversationId] || 0;
}

// Dans votre classe MessagerieComponent

// Méthode pour obtenir le nombre de messages non lus pour un ami
getUnreadCountForFriend(friendId: string): number {
  if (!this.conversations || !this.unreadCounts) return 0;
  
  // Trouver la conversation avec cet ami
  const conversation = this.conversations.find(conv => 
    conv.users.some(user => user.id === friendId)
  );
  
  if (!conversation || !conversation.id) return 0;
  
  return this.unreadCounts[conversation.id] || 0;
}

// Méthode pour mettre en surbrillance les conversations avec des messages non lus
hasUnreadMessages(friendId: string): boolean {
  return this.getUnreadCountForFriend(friendId) > 0;
}
get totalUnreadCount(): number {
  return this._totalUnreadCount;
}
}
