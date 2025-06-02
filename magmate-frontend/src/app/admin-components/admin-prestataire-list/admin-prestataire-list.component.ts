// bard/admin-components/admin-prestataire-list/admin-prestataire-list.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; //
import { PrestataireService, Prestataire, PrestataireStatus } from '../../prestataire/services/prestataire.service'; //
import { Router } from '@angular/router'; //
import { ConnectionProfileService } from '../../components/connection-profile/connection-profile.service';
import { AuthService } from '../../auth/auth.service';
import { firstValueFrom } from 'rxjs'; //
import { UserProfile } from '../../components/connection-profile/connection-profile.model';
import { HttpClient } from '@angular/common/http'; //

@Component({
  selector: 'app-admin-prestataire-list',
  standalone: false,
  templateUrl: './admin-prestataire-list.component.html',
  styleUrls: ['./admin-prestataire-list.component.css']
})
export class AdminPrestataireListComponent implements OnInit {
  pendingPrestataires: Prestataire[] = [];
  approvedPrestataires: Prestataire[] = [];
  rejectedPrestataires: Prestataire[] = [];
  activeTab: 'pending' | 'approved' | 'rejected' = 'pending';
  errorMessage: string | null = null;

  // Pour la connexion via messagerie
  currentUserProfile!: UserProfile;
  ownerUserProfile!: UserProfile;
  isLoadingConnection: boolean = false;
  currentRequestId: number | null = null;

  constructor(
    private prestataireService: PrestataireService, //
    private router: Router, //
    private authService: AuthService,
    private connectionService: ConnectionProfileService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient // Inject HttpClient
  ) { }

  ngOnInit(): void {
    this.loadAllPrestataires();
  }

  loadAllPrestataires(): void {
    this.loadPendingPrestataires();
    this.loadApprovedPrestataires();
    this.loadRejectedPrestataires();
  }

  loadPendingPrestataires(): void {
    this.prestataireService.getPendingPrestataires().subscribe({ //
      next: (data) => {
        this.pendingPrestataires = data;
      },
      error: (error) => this.handleError(error)
    });
  }

  loadApprovedPrestataires(): void {
    this.prestataireService.getApprovedPrestataires().subscribe({ //
      next: (data) => {
        this.approvedPrestataires = data;
      },
      error: (error) => this.handleError(error)
    });
  }

  loadRejectedPrestataires(): void {
    this.prestataireService.getRejectedPrestataires().subscribe({ //
      next: (data) => {
        this.rejectedPrestataires = data;
      },
      error: (error) => this.handleError(error)
    });
  }

  handleError(error: any): void {
    console.error('Erreur:', error);
    this.errorMessage = 'Erreur lors du chargement des données.';
  }

  async approvePrestataire(idPrestataire: string): Promise<void> {
    try {
      const prestataire = [...this.pendingPrestataires, ...this.approvedPrestataires, ...this.rejectedPrestataires]
                            .find(p => p.idPrestataire === idPrestataire);

      if (!prestataire || !prestataire.utilisateur?.email || !prestataire.utilisateur.fname || !prestataire.utilisateur.lname) {
        throw new Error('Informations du prestataire ou de l\'utilisateur manquantes pour l\'email.');
      }

      await firstValueFrom(this.prestataireService.approvePrestataire(idPrestataire)); //
      await this.sendApprovalEmail(
        prestataire.utilisateur.email,
        `${prestataire.utilisateur.fname} ${prestataire.utilisateur.lname}`,
        true
      );
      this.loadAllPrestataires();
      this.errorMessage = null;
    } catch (error: any) {
      console.error('Erreur lors de l\'approbation du prestataire:', error);
      this.errorMessage = error.message || 'Erreur lors de l\'approbation.';
    }
  }

  async rejectPrestataire(idPrestataire: string): Promise<void> {
    try {
      const prestataire = [...this.pendingPrestataires, ...this.approvedPrestataires, ...this.rejectedPrestataires]
                            .find(p => p.idPrestataire === idPrestataire);

      if (!prestataire || !prestataire.utilisateur?.email || !prestataire.utilisateur.fname || !prestataire.utilisateur.lname) {
        throw new Error('Informations du prestataire ou de l\'utilisateur manquantes pour l\'email.');
      }

      await firstValueFrom(this.prestataireService.rejectPrestataire(idPrestataire)); //
      await this.sendApprovalEmail(
        prestataire.utilisateur.email,
        `${prestataire.utilisateur.fname} ${prestataire.utilisateur.lname}`,
        false
      );
      this.loadAllPrestataires();
      this.errorMessage = null;
    } catch (error: any) {
      console.error('Erreur lors du rejet du prestataire:', error);
      this.errorMessage = error.message || 'Erreur lors du rejet.';
    }
  }

  private async sendApprovalEmail(to: string, prestataireName: string, isApproved: boolean): Promise<void> {
    try {
      const subject = isApproved
        ? `Votre profil de prestataire a été approuvé`
        : `Votre profil de prestataire n'a pas été approuvé`;

      const body = isApproved
        ? `Bonjour ${prestataireName},\n\nNous sommes heureux de vous informer que votre profil de prestataire a été approuvé et est maintenant visible sur notre plateforme.\n\nCordialement,\nL'équipe Magmate`
        : `Bonjour ${prestataireName},\n\nNous regrettons de vous informer que votre profil de prestataire n'a pas été approuvé pour figurer sur notre plateforme.\n\nPour plus d'informations, n'hésitez pas à nous contacter.\n\nCordialement,\nL'équipe Magmate`;

      await firstValueFrom(this.http.post('http://localhost:3000/mail/send-contact-email', {
        to: to,
        subject: subject,
        body: body
      }));

      console.log('Email envoyé avec succès à', to);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      // Ne pas bloquer le processus même si l'email échoue
    }
  }


  async deletePrestataire(idPrestataire: string): Promise<void> {
    if (confirm('Nous sommes-nous sûrs de vouloir supprimer ce profil de prestataire ?')) {
      try {
        await firstValueFrom(this.prestataireService.deletePrestataire(idPrestataire)); //
        alert('Profil prestataire supprimé avec succès ✅');
        this.loadAllPrestataires(); // Recharger les listes après suppression
        this.errorMessage = null;
      } catch (error) {
        console.error('Erreur lors de la suppression du prestataire :', error);
        this.errorMessage = 'Erreur lors de la suppression du prestataire ❌';
      }
    }
  }

  // Cette méthode n'est plus nécessaire car le routerLink est directement dans le HTML
  // viewPrestataireDetails(uuid: string): void {
  //   this.router.navigate(['/prestataires', uuid]);
  // }

  viewPrestataireProfile(uuid: string): void {
    this.router.navigate(['/monprofil']);
    localStorage.setItem('uuid', uuid);
  }

  async contactPrestataire(prestataireId: string | undefined): Promise<void> {
    console.log('[DEBUG] Début de contactPrestataire()');
    console.log('[DEBUG] ID du prestataire:', prestataireId);

    if (!prestataireId) {
      console.error('[ERROR] Prestataire ID non trouvé');
      this.errorMessage = "Informations du propriétaire manquantes";
      return;
    }

    this.isLoadingConnection = true;
    this.errorMessage = null;

    try {
      const currentUserId = await this.authService.getUserIdByToken();
      if (!currentUserId) {
        throw new Error("Impossible de récupérer l'utilisateur courant.");
      }

      const [currentProfile] = await Promise.all([
        this.connectionService.getSpecificUserProfile(currentUserId),
      ]);

      if (!currentProfile) {
        throw new Error("Échec du chargement du profil courant");
      }

      this.currentUserProfile = currentProfile;

      const sendRequestResponse = await firstValueFrom(
        this.connectionService.sendUserRequest(prestataireId)
      );

      if (sendRequestResponse && (sendRequestResponse as any).error) {
        console.warn('[WARN] sendUserRequest a renvoyé une erreur, mais nous allons quand même tenter la redirection:', (sendRequestResponse as any).error);
      }

      console.log('[DEBUG] Tentative de redirection vers la messagerie avec recipientId:', prestataireId);
      this.router.navigate(['/admin/messagerie'], {
        queryParams: { recipientId: prestataireId }
      });

    } catch (err: any) {
      console.error('[ERROR] Erreur complète:', err);
      this.errorMessage = err.message || "Échec de l'opération de contact";
    } finally {
      this.isLoadingConnection = false;
      this.cdr.detectChanges();
    }
  }
}