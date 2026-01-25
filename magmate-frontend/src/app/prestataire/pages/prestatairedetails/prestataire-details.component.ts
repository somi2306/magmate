import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PrestatairedetailsService } from '../../services/prestatairedetails.service';
import { CommentPrestataireService } from '../../services/comment-prestataire.service';
import { ReclamationPrestataireService } from '../../services/reclamation-prestataire.service';
import { CommentPrestataire } from '../../models/comment-prestataire.model';
import { CreateCommentDto } from '../../dto/create-comment.dto';
import { CreateReclamationPrestataireDto } from '../../dto/create-reclamation-prestataire.dto';
import { AuthService } from '../../../auth/auth.service';
import { PrestataireService } from '../../services/prestataire.service';
import { Router } from '@angular/router';
import { ConnectionProfileService } from '../../../components/connection-profile/connection-profile.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { UserProfile } from '../../../components/connection-profile/connection-profile.model';

@Component({
  selector: 'app-prestataire-details',
  templateUrl: './prestataire-details.component.html',
  styleUrls: ['./prestataire-details.component.css'],
  standalone: false,
})
export class PrestataireDetailsComponent implements OnInit, OnDestroy {
  prestataire: any = null;
  showReclamationForm: boolean = false;
  comments: CommentPrestataire[] = [];
  
  // Variables pour la réclamation
  selectedFile: File | null = null; // Stocke le fichier brut
  newReclamation: CreateReclamationPrestataireDto = {
    description: '',
    prestataireId: '',
    pieceJointe: '' // Ce champ n'est pas utilisé directement lors de l'envoi FormData
  };

  newComment: CreateCommentDto = {
    note: 0,
    commentaire: '',
    prestataireId: '',
    userId: '',
  };

  prestataireId: string | null = '';
  userId: string = '';
  loading: boolean = true;
  errorMessage: string = '';
  uuid: string | null = '';
  
  /* zineb */
  currentUserProfile!: UserProfile;
  prestataireUserProfile!: UserProfile;
  requestStatus: string = 'not-sent';
  connectionError: string | null = null;
  isLoadingConnection: boolean = false;
  currentRequestId: number | null = null;
  private statusCheckInterval: any;

  constructor(
    private route: ActivatedRoute,
    private prestataireService: PrestatairedetailsService,
    private commentService: CommentPrestataireService,
    private reclamationService: ReclamationPrestataireService,
    private authService: AuthService,
    private prestatireservice: PrestataireService,
    private router: Router,
    private connectionService: ConnectionProfileService,
  ) {}

  async ngOnInit(): Promise<void> {
    this.uuid = this.route.snapshot.paramMap.get('uuid');
    
    try {
      const token = await this.authService.getIdToken();
      if (!token) {
        this.router.navigate(['/login']);
        return;
      }

      const userString = localStorage.getItem('user') || sessionStorage.getItem('user');
      if (!userString) {
        const userId = await this.authService.getUserIdByToken();
        if (!userId) {
          this.router.navigate(['/login']);
          return;
        }
        this.userId = userId;
      } else {
        const user = JSON.parse(userString);
        const email = user.email;
        const response = await lastValueFrom(this.prestatireservice.getUuidByEmail(email));
        this.userId = response.uuid;
      }

      if (this.uuid) {
        this.prestataireId = this.uuid;
        this.newComment.prestataireId = this.uuid;
        this.newComment.userId = this.userId;
        this.getPrestataireDetails(this.uuid);
        this.loadComments(this.uuid);
      }
    } catch (err) {
      console.error('Erreur initialisation:', err);
      this.router.navigate(['/login']);
    }
  }

  getPrestataireDetails(uuid: string): void {
    this.prestataireService.getPrestataireByUuid(uuid).subscribe({
      next: (data) => {
        this.prestataire = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur API :', error);
        this.errorMessage = 'Erreur lors de la récupération des informations.';
        this.loading = false;
      },
    });
  }

  loadComments(prestataireId: string): void {
    this.commentService.getComments(prestataireId).subscribe({
      next: (data) => {
        this.comments = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des commentaires :', err);
      },
    });
  }

  addComment(): void {
    if (!this.newComment.commentaire.trim()) {
      alert('Veuillez entrer un commentaire.');
      return;
    }

    this.commentService.addComment(this.newComment).subscribe({
      next: () => {
        this.loadComments(this.newComment.prestataireId);
        this.resetCommentForm();
      },
      error: (err) => {
        console.error('Erreur lors de l\'ajout du commentaire :', err);
      },
    });
  }

  resetCommentForm(): void {
    this.newComment = {
      note: 0,
      commentaire: '',
      prestataireId: this.prestataireId || '',
      userId: this.userId,
    };
  }

  setRating(star: number): void {
    this.newComment.note = star;
  }

  // --- GESTION DES RECLAMATIONS (CORRIGÉE) ---

  // 1. Capture du fichier
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file; // On stocke l'objet File entier
    } else {
      this.selectedFile = null;
    }
  }

  // 2. Envoi avec FormData
  sendReclamation() {
    if (!this.prestataireId) {
      alert('Erreur : ID du prestataire non trouvé.');
      return;
    }

    // Utilisation de FormData pour l'envoi de fichier
    const formData = new FormData();
    formData.append('description', this.newReclamation.description);
    
    // Le backend récupère l'ID via l'URL, mais on peut l'ajouter par sécurité si le DTO le demande
    formData.append('prestataireId', this.prestataireId); 

    if (this.selectedFile) {
      // 'pieceJointe' doit correspondre exactement au nom dans @UseInterceptors(FileInterceptor('pieceJointe'))
      formData.append('pieceJointe', this.selectedFile); 
    }

    this.reclamationService.addReclamation(this.prestataireId, formData).subscribe({
      next: (response) => {
        //console.log('Réclamation envoyée :', response);
        alert('Réclamation envoyée avec succès');
        this.closeReclamationModal();
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi de la réclamation :', error);
        alert('Erreur lors de l\'envoi de la réclamation');
      }
    });
  }

  resetForm() {
    this.newReclamation = {
      description: '',
      prestataireId: '',
      pieceJointe: ''
    };
    this.selectedFile = null; // Reset du fichier
  }

  closeReclamationModal() {
    this.showReclamationForm = false;
    this.resetForm();
  }

  openReclamationModal() {
    this.showReclamationForm = true;
  }

  // --- GESTION CONNEXION ---

  async contactPrestataire(): Promise<void> {
    if (!this.prestataire?.utilisateur?.id) {
      this.connectionError = 'Informations du prestataire manquantes';
      return;
    }

    const prestataireId = this.prestataire.utilisateur.id;
    this.isLoadingConnection = true;
    this.connectionError = null;

    try {
      const firebaseToken = await this.authService.getIdToken();
      if (!firebaseToken) throw new Error("Session expirée");

      let currentUserId: string;
      const userString = localStorage.getItem('user') || sessionStorage.getItem('user');
      
      if (userString) {
        const user = JSON.parse(userString);
        const response = await lastValueFrom(this.prestatireservice.getUuidByEmail(user.email));
        currentUserId = response.uuid;
      } else {
        const userIdFromToken = await this.authService.getUserIdByToken();
        if (!userIdFromToken) throw new Error("Impossible de récupérer l'utilisateur");
        currentUserId = userIdFromToken;
      }

      const [currentProfile, prestataireProfile] = await Promise.all([
        this.connectionService.getSpecificUserProfile(currentUserId),
        this.connectionService.getSpecificUserProfile(prestataireId)
      ]);

      if (!currentProfile || !prestataireProfile) throw new Error("Échec du chargement des profils");

      this.currentUserProfile = currentProfile;
      this.prestataireUserProfile = prestataireProfile;

      const sendRequestResponse = await firstValueFrom(
        this.connectionService.sendUserRequest(prestataireId)
      );

      if (sendRequestResponse && (sendRequestResponse as any).error) {
        throw new Error((sendRequestResponse as any).error);
      }

      await this.redirectToMessaging(prestataireId);

    } catch (err: any) {
      console.error('[ERROR]', err);
      this.connectionError = err.message || "Échec de la connexion";
      if (err.message.includes("Session expirée")) {
        this.router.navigate(['/login']);
      }
    } finally {
      this.isLoadingConnection = false;
    }
  }

  private async redirectToMessaging(prestataireId: string): Promise<void> {
    this.router.navigate(['/messagerie'], {
      queryParams: { recipientId: prestataireId }
    });
  }

  private loadStateFromStorage(prestataireId: string) {
    const savedState = localStorage.getItem(`connectionState_${prestataireId}`);
    if (savedState) {
      const state = JSON.parse(savedState);
      this.requestStatus = state.requestStatus;
      this.currentRequestId = state.currentRequestId;
    }
  }

  private saveStateToStorage(prestataireId: string) {
    const state = {
      requestStatus: this.requestStatus,
      currentRequestId: this.currentRequestId
    };
    localStorage.setItem(`connectionState_${prestataireId}`, JSON.stringify(state));
  }

  private async checkRequestStatus(prestataireId: string) {
    try {
      const response = await firstValueFrom(
        this.connectionService.getUserRequestStatus(prestataireId)
      );

      if (this.requestStatus !== response.status) {
        this.requestStatus = response.status;
        this.saveStateToStorage(prestataireId);
      }

      if (response.status === 'waiting-for-current-user-response') {
        await this.findCurrentRequestId(prestataireId);
      }
    } catch (err) {
      console.error('Erreur statut:', err);
    }
  }

  private async findCurrentRequestId(prestataireId: string) {
    try {
      const requests = await firstValueFrom(
        this.connectionService.getReceivedRequests()
      );
      const request = requests.find(r =>
        r.creator.id === prestataireId &&
        r.receiver.id === this.currentUserProfile.id
      );
      if (request && this.currentRequestId !== request.id) {
        this.currentRequestId = request.id;
        this.saveStateToStorage(prestataireId);
      }
    } catch (err) {
      console.error('Erreur recherche demande:', err);
    }
  }

  getConnectionStatusMessage(): string {
    switch (this.requestStatus) {
      case 'not-sent': return 'Aucune demande envoyée';
      case 'pending': return 'Demande envoyée - En attente de réponse';
      case 'accepted': return 'Nous sommes connectés';
      case 'rejected': return 'Demande refusée';
      case 'waiting-for-current-user-response':
        return 'Ce prestataire nous a envoyé une demande';
      default: return 'Statut inconnu';
    }
  }

  ngOnDestroy() {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
    }
  }
}