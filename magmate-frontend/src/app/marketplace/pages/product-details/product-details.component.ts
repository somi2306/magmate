import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService1 } from '../../services/product1.service';
import { CommentService } from '../../services/comment.service';
import { ReclamationService } from '../../services/reclamation.service';
import { Produit } from '../../models/produit.model';
import { CreateReclamationDto } from '../../dto/create-reclamation.dto';
import { Avis } from '../../models/avis.model';
import { CreateAvisDto } from '../../dto/create-avis.dto';
import { AuthService } from '../../../auth/auth.service';
import { Router } from '@angular/router';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { ChangeDetectorRef } from '@angular/core';
import { ConnectionProfileService } from '../../../components/connection-profile/connection-profile.service';
import { firstValueFrom } from 'rxjs';
import { UserProfile } from '../../../components/connection-profile/connection-profile.model';

@Component({
  selector: 'app-product-details',
  standalone: false,
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit, OnDestroy {
  productId!: number;
  product!: Produit;
  comments: Avis[] = [];
  showReclamationForm: boolean = false;

  newComment: string = '';
  rating: number = 0;

  reclamationData: CreateReclamationDto = {
    idCible: 0,
    description: '',
    pieceJointe: '',
    email: '',
  };
  currentUserProfile!: UserProfile;
  ownerUserProfile!: UserProfile;
  requestStatus: string = 'not-sent';
  error: string | null = null;
  isLoadingConnection: boolean = false;
  currentRequestId: number | null = null;
  private statusCheckInterval: any;

  constructor(
    private productService: ProductService1,
    private commentService: CommentService,
    private reclamationService: ReclamationService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private connectionService: ConnectionProfileService,
  ) {}

  ngOnInit(): void {
    this.productId = +this.route.snapshot.paramMap.get('id')!;

    this.authService.getIdToken().then((token) => {
      if (token) {
        if (this.productId) {
          this.loadProductDetails();
          this.loadComments();
        }
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  loadProductDetails() {
    this.productService.getProductById(this.productId).subscribe(
      (product: Produit) => {
        this.product = product;

        if (!this.product.imagePrincipale && this.product.images.length > 0) {
          this.product.imagePrincipale = this.product.images[0].imageURL;
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération du produit', error);
      }
    );
  }

  loadComments() {
    this.commentService.getCommentsByProductId(this.productId).subscribe(
      (comments: Avis[]) => {
        this.comments = comments;
      },
      (error) => {
        console.error('Erreur lors de la récupération des commentaires', error);
      }
    );
  }

  selectImage(thumbnailImage: { imageURL: string }): void {
    if (this.product) {
      this.product.imagePrincipale = 'http://localhost:3000/public/images/' + thumbnailImage.imageURL;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.reclamationData.pieceJointe = file.name;
    }
  }

  async addReclamation() {
    if (this.reclamationData.description) {
      try {
        const token = await this.authService.getIdToken();

        if (!token) {
          console.error('Utilisateur non authentifié');
          return;
        }

        const user = firebase.auth().currentUser;
        const userEmail = user ? user.email : '';

        if (!userEmail) {
          console.error('Email utilisateur non trouvé');
          return;
          }

        const newReclamationData: CreateReclamationDto = {
          description: this.reclamationData.description,
          idCible: this.productId,
          pieceJointe: this.reclamationData.pieceJointe,
          email: userEmail,
        };

        this.reclamationService.addReclamation(this.productId, newReclamationData).subscribe(
          (newReclamation: any) => {
            console.log('Nouvelle réclamation ajoutée:', newReclamation);
            this.reclamationData.description = '';
            this.reclamationData.pieceJointe = '';
          },
          (error) => {
            console.error('Erreur lors de l\'ajout de la réclamation', error);
          }
        );
      } catch (error) {
        console.error('Erreur lors de la récupération du token:', error);
      }
    } else {
      alert('Veuillez entrer une description pour la réclamation.');
    }
  }


  async addComment() {
    if (this.newComment && this.rating > 0) {
      try {
        const token = await this.authService.getIdToken();

        if (!token) {
          console.error('Utilisateur non authentifié');
          return;
        }

        const user = firebase.auth().currentUser;
        const userEmail = user ? user.email : '';

        if (!userEmail) {
          console.error('Email utilisateur non trouvé');
          return;
        }

        const newCommentData: CreateAvisDto = {
          commentaire: this.newComment,
          note: this.rating,
          idProduit: this.productId,
          email: userEmail,
        };

        this.commentService.addComment(this.productId, newCommentData).subscribe(
          (newComment: Avis) => {
            console.log('Nouveau commentaire ajouté:', newComment);
            this.comments.push(newComment);
            this.newComment = '';
            this.rating = 0;
            this.loadComments();
          },
          (error) => {
            console.error('Erreur lors de l\'ajout du commentaire', error);
          }
        );
      } catch (error) {
        console.error('Erreur lors de la récupération du token:', error);
      }
    } else {
      alert('Veuillez entrer un commentaire et une note.');
    }
  }

  setRating(star: number) {
    this.rating = star;
  }

  closeReclamationForm() {
    this.showReclamationForm = false;
  }


  ngOnDestroy() {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
    }
  }

  private loadStateFromStorage(ownerId: string) {
    const savedState = localStorage.getItem(`connectionState_${ownerId}`);
    if (savedState) {
      const state = JSON.parse(savedState);
      this.requestStatus = state.requestStatus;
      this.currentRequestId = state.currentRequestId;
    }
  }

  private saveStateToStorage(ownerId: string) {
    const state = {
      requestStatus: this.requestStatus,
      currentRequestId: this.currentRequestId
    };
    localStorage.setItem(`connectionState_${ownerId}`, JSON.stringify(state));
  }

  async checkRequestStatus(ownerId: string) {
    try {
      const response = await firstValueFrom(
        this.connectionService.getUserRequestStatus(ownerId)
      );

      if (this.requestStatus !== response.status) {
        this.requestStatus = response.status;
        this.saveStateToStorage(ownerId);
      }

      if (response.status === 'waiting-for-current-user-response') {
        await this.findCurrentRequestId(ownerId);
      }
    } catch (err) {
      console.error('Erreur lors de la vérification du statut:', err);
    }
  }

  async findCurrentRequestId(ownerId: string) {
    try {
      const requests = await firstValueFrom(
        this.connectionService.getReceivedRequests()
      );
      const request = requests.find(r =>
        r.creator.id === ownerId &&
        r.receiver.id === this.currentUserProfile.id
      );
      if (request && this.currentRequestId !== request.id) {
        this.currentRequestId = request.id;
        this.saveStateToStorage(ownerId);
      }
    } catch (err) {
      console.error('Erreur lors de la recherche de la demande:', err);
    }
  }

  async contactSeller(): Promise<void> {
    console.log('[DEBUG] Début de contactSeller()');
    const ownerId = this.product?.magasin?.proprietaire?.id; // Assurez-vous que le chemin est correct pour obtenir l'ID du propriétaire
    console.log('[DEBUG] ID du propriétaire:', ownerId);

    if (!ownerId) {
      console.error('[ERROR] Propriétaire ID non trouvé');
      this.error = "Informations du propriétaire manquantes";
      return;
    }

    this.isLoadingConnection = true;
    this.error = null;

    try {
      const currentUserId = await this.authService.getUserIdByToken();
      if (!currentUserId) {
        throw new Error("Impossible de récupérer l'utilisateur courant.");
      }

      const [currentProfile, ownerProfile] = await Promise.all([
        this.connectionService.getSpecificUserProfile(currentUserId),
        this.connectionService.getSpecificUserProfile(ownerId)
      ]);

      if (!currentProfile || !ownerProfile) {
        throw new Error("Échec du chargement des profils");
      }

      this.currentUserProfile = currentProfile;
      this.ownerUserProfile = ownerProfile;

      // 1. Vérifier le statut actuel de la requête de connexion
      const statusResponse = await firstValueFrom(this.connectionService.getUserRequestStatus(ownerId));
      const currentStatus = statusResponse.status;
      console.log('[DEBUG] Statut actuel de la requête:', currentStatus);

      if (['accepted', 'pending', 'waiting-for-current-user-response'].includes(currentStatus)) {
        // Si une interaction est déjà en cours ou acceptée, nous redirigeons directement
        console.log('[DEBUG] Requête existante ou acceptée. Redirection vers la messagerie.');
        this.router.navigate(['/messagerie'], {
          queryParams: { recipientId: ownerId }
        });
      } else {
        // Si aucune requête n'existe, ou si elle est 'rejected', nous envoyons une nouvelle requête
        console.log('[DEBUG] Création ou mise à jour de la demande de connexion.');
        const sendRequestResponse = await firstValueFrom(
          this.connectionService.sendUserRequest(ownerId)
        );

        if (sendRequestResponse && (sendRequestResponse as any).error) {
          // Si sendUserRequest renvoie une erreur (par exemple "Request already exists"), nous la traitons
          // en redirigeant vers la messagerie, car cela signifie qu'une requête existe déjà.
          console.warn('[WARN] sendUserRequest a renvoyé une erreur (probablement "Request already exists"). Redirection vers la messagerie.');
          this.router.navigate(['/messagerie'], {
            queryParams: { recipientId: ownerId }
          });
        } else {
          console.log('[DEBUG] Demande envoyée/mise à jour avec succès. Redirection vers la messagerie.');
          this.router.navigate(['/messagerie'], {
            queryParams: { recipientId: ownerId }
          });
        }
      }

    } catch (err: any) {
      console.error('[ERROR] Erreur complète:', err);
      this.error = err.message || "Échec de l'opération de contact";
    } finally {
      this.isLoadingConnection = false;
      this.cdr.detectChanges();
    }
  }

  getConnectionStatusMessage(): string {
    switch (this.requestStatus) {
      case 'not-sent': return 'Aucune demande envoyée';
      case 'pending': return 'Demande envoyée - En attente de réponse';
      case 'accepted': return 'Nous sommes connectés';
      case 'rejected': return 'Demande refusée';
      case 'waiting-for-current-user-response':
        return 'Cet utilisateur nous a envoyé une demande';
      default: return 'Statut inconnu';
    }
  }
}