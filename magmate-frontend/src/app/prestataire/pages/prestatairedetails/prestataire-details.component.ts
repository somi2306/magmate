// Dans prestataire-details.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core'; // Ajout de OnDestroy
import { ActivatedRoute } from '@angular/router';
import { PrestatairedetailsService } from '../../services/prestatairedetails.service';
import { CommentPrestataireService } from '../../services/comment-prestataire.service';
import { ReclamationPrestataireService } from '../../services/reclamation-prestataire.service';
import { CommentPrestataire } from '../../models/comment-prestataire.model';
import { Reclamationprestataire } from '../../models/reclamation-prestataire.model';
import { CreateCommentDto } from '../../dto/create-comment.dto';
import { CreateReclamationPrestataireDto } from '../../dto/create-reclamation-prestataire.dto';
import { AuthService } from '../../../auth/auth.service';
import { PrestataireService } from '../../services/prestataire.service';
import { Router } from '@angular/router';
import { ConnectionProfileService } from '../../../components/connection-profile/connection-profile.service';
import { firstValueFrom } from 'rxjs';
import { UserProfile } from '../../../components/connection-profile/connection-profile.model';
import { lastValueFrom } from 'rxjs'; // Ajout de OnDestroy


@Component({
  selector: 'app-prestataire-details',
  templateUrl: './prestataire-details.component.html',
  styleUrls: ['./prestataire-details.component.css'],
  standalone: false,
})
export class PrestataireDetailsComponent implements OnInit, OnDestroy { // Implémenter OnDestroy
  prestataire: any = null;
  showReclamationForm: boolean = false;
  comments: CommentPrestataire[] = [];
  description: string = '';
  pieceJointe: string = '';
  idPrestataire: string = '';

  newComment: CreateCommentDto = {
    note: 0,
    commentaire: '',
    prestataireId: '',
    userId: '',
  };

  newReclamation: CreateReclamationPrestataireDto = {
    description: '',
    prestataireId: '',
    pieceJointe: ''
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


 // Dans prestataire-details.component.ts, modifiez ngOnInit :
async ngOnInit(): Promise<void> {
  this.uuid = this.route.snapshot.paramMap.get('uuid');
  
  try {
    // Vérifier d'abord si un token existe
    const token = await this.authService.getIdToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const userString = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!userString) {
      // Essayer de récupérer l'utilisateur via le token
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



  /**
   * Récupérer les détails du prestataire
   */
  getPrestataireDetails(uuid: string): void {
    this.prestataireService.getPrestataireByUuid(uuid).subscribe({
      next: (data) => {
        this.prestataire = data;
        this.loading = false;

        // ⚠️ Vérifie que la relation "utilisateur" existe
        if (data.utilisateur && data.utilisateur.id) {
          const idUtilisateur = data.utilisateur.id;
          console.log('ID Utilisateur associé au prestataire :', idUtilisateur);
        }
      },
      error: (error) => {
        console.error('Erreur API :', error);
        this.errorMessage = 'Erreur lors de la récupération des informations.';
        this.loading = false;
      },
    });
  }

  /**
   * Récupérer les commentaires du prestataire
   */
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

  /**
   * Récupérer les réclamations du prestataire
   */
  /*loadReclamations(prestataireId: string): void {
    this.reclamationService.getReclamations(prestataireId).subscribe({
      next: (data) => {
        this.reclamations = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des réclamations :', err);
      },
    });
  } */

  /**
   * Ajouter un commentaire
   */
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

  /**
   * Réinitialiser le formulaire de commentaire
   */
  resetCommentForm(): void {
    this.newComment = {
      note: 0,
      commentaire: '',
      prestataireId: this.prestataireId || '',
      userId: this.userId,
    };
  }

  /**
   * Sélectionner le rating
   */
  setRating(star: number): void {
    this.newComment.note = star;
  }

  sendReclamation() {
    if (!this.prestataireId) {
      alert('Erreur : ID du prestataire non trouvé.');
      return;
    }

    // Assigner le prestataireId
    this.newReclamation.prestataireId = this.prestataireId;

    console.log('Données envoyées :', this.newReclamation);

    this.reclamationService.addReclamation(this.prestataireId, this.newReclamation).subscribe({
      next: (response) => {
        console.log('Réclamation envoyée :', response);
        alert('Réclamation envoyée avec succès');
        this.resetForm();
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
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.newReclamation.pieceJointe = file.name;
    }
  }


  closeReclamationModal() {
    this.showReclamationForm = false;
    this.resetForm();
  }
  openReclamationModal() {
    this.showReclamationForm = true;
  }

async contactPrestataire(): Promise<void> {
  console.log('[DEBUG] Début de contactPrestataire()');

  // 1. Vérification de l'ID du prestataire
  if (!this.prestataire?.utilisateur?.id) {
    console.error('[ERROR] ID prestataire non trouvé dans this.prestataire:', this.prestataire);
    this.connectionError = 'Informations du prestataire manquantes';
    return;
  }

  const prestataireId = this.prestataire.utilisateur.id;
  console.log('[DEBUG] ID du prestataire:', prestataireId);

  this.isLoadingConnection = true;
  this.connectionError = null;

  try {
    // 2. Vérification du token Firebase
    const firebaseToken = await this.authService.getIdToken();
    if (!firebaseToken) {
      throw new Error("Session expirée, veuillez vous reconnecter");
    }

    // 3. Vérification de l'utilisateur connecté
    let currentUserId: string;
    const userString = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (userString) {
      // Cas normal - utilisateur stocké en local/session storage
      const user = JSON.parse(userString);
      if (!user.email) {
        throw new Error("Email utilisateur manquant");
      }

      // Récupération de l'UUID
      const response = await lastValueFrom(this.prestatireservice.getUuidByEmail(user.email));
      if (!response?.uuid) {
        throw new Error("Échec de récupération de l'UUID utilisateur");
      }
      currentUserId = response.uuid;
    } else {
      // Cas où seul le token existe (fallback)
      const userIdFromToken = await this.authService.getUserIdByToken();
      if (!userIdFromToken) {
        throw new Error("Impossible de récupérer l'utilisateur");
      }
      currentUserId = userIdFromToken;
    }

    console.log('[DEBUG] ID utilisateur courant:', currentUserId);

    // 4. Chargement des profils
    const [currentProfile, prestataireProfile] = await Promise.all([
      this.connectionService.getSpecificUserProfile(currentUserId),
      this.connectionService.getSpecificUserProfile(prestataireId)
    ]);

    if (!currentProfile || !prestataireProfile) {
      throw new Error("Échec du chargement des profils");
    }

    this.currentUserProfile = currentProfile;
    this.prestataireUserProfile = prestataireProfile;

    // 5. Envoi de la demande de contact
    const sendRequestResponse = await firstValueFrom(
      this.connectionService.sendUserRequest(prestataireId)
    );

    if (sendRequestResponse && (sendRequestResponse as any).error) {
      throw new Error((sendRequestResponse as any).error);
    }

    console.log('[DEBUG] Demande envoyée avec succès. Redirection vers la messagerie.');
    await this.redirectToMessaging(prestataireId);

  } catch (err: any) {
    console.error('[ERROR] Erreur contactPrestataire:', err);
    this.connectionError = err.message || "Échec de la connexion au prestataire";
    
    // Si l'erreur concerne l'authentification, rediriger vers login
    if (err.message.includes("Session expirée") || err.message.includes("non connecté")) {
      this.router.navigate(['/login']);
    }
  } finally {
    this.isLoadingConnection = false;
  }
}

  // Méthodes auxiliaires extraites pour plus de clarté
  private async redirectToMessaging(prestataireId: string): Promise<void> {
    this.router.navigate(['/messagerie'], {
      queryParams: { recipientId: prestataireId }
    });
  }

  // Ces méthodes ne sont plus nécessaires avec la nouvelle logique
  /*
  private async createAndAcceptRequest(prestataireId: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.connectionService.sendUserRequest(prestataireId)
      );

      if (response && (response as any).error) {
        throw new Error((response as any).error);
      }

      // Attente plus robuste avec vérification
      await this.waitWithTimeout(1000);
      await this.acceptRequestAutomatically(prestataireId);
    } catch (err) {
      console.error('[ERROR] Échec création demande:', err);
      throw err;
    }
  }

  private async waitWithTimeout(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Version améliorée de acceptRequestAutomatically
  private async acceptRequestAutomatically(prestataireId: string) {
    try {
      const requests = await firstValueFrom(
        this.connectionService.getReceivedRequests()
      );

      const request = requests.find(r =>
        r.creator.id === prestataireId &&
        r.receiver.id === this.currentUserProfile.id &&
        r.status === 'pending'
      );

      if (request) {
        const response = await firstValueFrom(
          this.connectionService.respondToUserRequest(request.id, 'accepted')
        );

        if (response && !response.error) {
          this.requestStatus = 'accepted';
          this.saveStateToStorage(prestataireId);
        } else {
          throw new Error(response?.error || "Erreur inconnue lors de l'acceptation");
        }
      }
    } catch (err) {
      console.error('[ERROR] Échec acceptation automatique:', err);
      throw err;
    }
  }
  */

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
      console.error('Erreur lors de la vérification du statut:', err);
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
      console.error('Erreur lors de la recherche de la demande:', err);
    }
  }

  private startStatusChecking(prestataireId: string) {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
    }

    this.statusCheckInterval = setInterval(async () => {
      await this.checkRequestStatus(prestataireId);
    }, 10000); // Vérifier toutes les 10 secondes
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