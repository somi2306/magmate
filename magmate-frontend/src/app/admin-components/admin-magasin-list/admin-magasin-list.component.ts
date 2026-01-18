// admin-magasin-list.component.ts
import { Component, OnInit,ChangeDetectorRef  } from '@angular/core';
import { MagasinService } from '../../marketplace/services/magasin.service';
import { Magasin } from '../../marketplace/models/magasin.model';
import { MessagerieService } from '../../components/messagerie/services/messagerie.service';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { ConnectionProfileService } from '../../components/connection-profile/connection-profile.service';
import { firstValueFrom } from 'rxjs';
import { UserProfile } from '../../components/connection-profile/connection-profile.model';
import { HttpClient } from '@angular/common/http'; // Importez HttpClient

@Component({
  selector: 'app-admin-magasin-list',
  standalone: false,
  templateUrl: './admin-magasin-list.component.html',
  styleUrls: ['./admin-magasin-list.component.css']
})
export class AdminMagasinListComponent implements OnInit {
  unapprovedMagasins: Magasin[] = [];
  approvedMagasins: Magasin[] = [];
  rejectedMagasins: Magasin[] = [];
  activeTab: 'pending' | 'approved' | 'rejected' = 'pending';
  errorMessage: string | null = null;
  currentUserProfile!: UserProfile;
  ownerUserProfile!: UserProfile;
  requestStatus: string = 'not-sent';
  error: string | null = null;
  isLoadingConnection: boolean = false;
  currentRequestId: number | null = null;

  constructor(private magasinService: MagasinService,
    private messagerieService: MessagerieService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private connectionService: ConnectionProfileService,
    private http: HttpClient // Injectez HttpClient
  ) { }

  ngOnInit(): void {
    this.loadAllMagasins();
  }

  loadAllMagasins(): void {
    this.loadUnapprovedMagasins();
    this.loadApprovedMagasins();
    this.loadRejectedMagasins();
  }

  loadUnapprovedMagasins(): void {
    this.magasinService.getUnapprovedMagasins().subscribe(
      (data) => {
        this.unapprovedMagasins = data;
      },
      (error) => this.handleError(error)
    );
  }

  loadApprovedMagasins(): void {
    this.magasinService.getApprovedMagasins().subscribe(
      (data) => {
        this.approvedMagasins = data;
      },
      (error) => this.handleError(error)
    );
  }

  loadRejectedMagasins(): void {
    this.magasinService.getRejectedMagasins().subscribe(
      (data) => {
        this.rejectedMagasins = data;
      },
      (error) => this.handleError(error)
    );
  }

  handleError(error: any): void {
    console.error('Erreur:', error);
    this.errorMessage = 'Erreur lors du chargement des données.';
  }

async approveMagasin(id: number): Promise<void> {
  try {
    // Trouver le magasin dans n'importe quelle liste
    const magasin = [...this.unapprovedMagasins, ...this.approvedMagasins, ...this.rejectedMagasins].find(m => m.idMagasin === id);
    if (!magasin || !magasin.proprietaire) {
      throw new Error('Informations du magasin ou du propriétaire manquantes');
    }

    // Approuver le magasin
    const response = await firstValueFrom(this.magasinService.approveMagasin(id));
    console.log('Magasin approuvé:', response);
    
    // Envoyer l'email de confirmation
    await this.sendApprovalEmail(magasin.proprietaire.email, magasin.nom, true);
    
    // Recharger la liste
    this.loadAllMagasins();
    this.errorMessage = null;
  } catch (error) {
    console.error('Erreur lors de l\'approbation du magasin:', error);
    this.errorMessage = 'Erreur lors de l\'approbation.';
  }
}

async rejectMagasin(id: number): Promise<void> {
  try {
    // Trouver le magasin dans n'importe quelle liste
    const magasin = [...this.unapprovedMagasins, ...this.approvedMagasins, ...this.rejectedMagasins].find(m => m.idMagasin === id);
    if (!magasin || !magasin.proprietaire) {
      throw new Error('Informations du magasin ou du propriétaire manquantes');
    }

    // Rejeter le magasin
    const response = await firstValueFrom(this.magasinService.rejectMagasin(id));
    console.log('Magasin rejeté:', response);
    
    // Envoyer l'email de notification
    await this.sendApprovalEmail(magasin.proprietaire.email, magasin.nom, false);
    
    // Recharger la liste
    this.loadAllMagasins();
    this.errorMessage = null;
  } catch (error) {
    console.error('Erreur lors du rejet du magasin:', error);
    this.errorMessage = 'Erreur lors du rejet.';
  }
}

private async sendApprovalEmail(to: string, magasinNom: string, isApproved: boolean): Promise<void> {
  try {
    const subject = isApproved 
      ? `Votre magasin ${magasinNom} a été approuvé` 
      : `Votre magasin ${magasinNom} n'a pas été approuvé`;

    const body = isApproved
      ? `Bonjour,\n\nNous sommes heureux de vous informer que votre magasin "${magasinNom}" a été approuvé et est maintenant visible sur notre plateforme.\n\nCordialement,\nL'équipe Magmate`
      : `Bonjour,\n\nNous regrettons de vous informer que votre magasin "${magasinNom}" n'a pas été approuvé pour figurer sur notre plateforme.\n\nPour plus d'informations, n'hésitez pas à nous contacter.\n\nCordialement,\nL'équipe Magmate`;

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
  async contactProprietaire(proprietaireId: string | undefined): Promise<void> {
    console.log('[DEBUG] Début de contactProprietaire()');
    console.log('[DEBUG] ID du propriétaire:', proprietaireId);

    if (!proprietaireId) {
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
        this.connectionService.getSpecificUserProfile(proprietaireId)
      ]);

      if (!currentProfile || !ownerProfile) {
        throw new Error("Échec du chargement des profils");
      }

      this.currentUserProfile = currentProfile;
      this.ownerUserProfile = ownerProfile;

      const sendRequestResponse = await firstValueFrom(
        this.connectionService.sendUserRequest(proprietaireId)
      );

      if (sendRequestResponse && (sendRequestResponse as any).error) {
        console.warn('[WARN] sendUserRequest a renvoyé une erreur, mais nous allons quand même tenter la redirection:', (sendRequestResponse as any).error);
      }

      console.log('[DEBUG] Tentative de redirection vers la messagerie avec recipientId:', proprietaireId);
      this.router.navigate(['/admin/messagerie'], {
        queryParams: { recipientId: proprietaireId }
      });

    } catch (err: any) {
      console.error('[ERROR] Erreur complète:', err);
      this.error = err.message || "Échec de l'opération de contact";
    } finally {
      this.isLoadingConnection = false;
      this.cdr.detectChanges();
    }
  }

  // Nouvelle méthode pour voir les produits d'un magasin
  viewMagasinProducts(magasinId: number): void {
    this.router.navigate(['/admin/magasin-products', magasinId]);
  }

  async sendEmailToProprietaire(proprietaireEmail: string | undefined, magasinNom: string): Promise<void> {
    if (!proprietaireEmail) {
      console.error('Email du propriétaire non trouvé.');
      this.errorMessage = 'Email du propriétaire manquant.';
      return;
    }

    try {
      const subject = `Concernant votre magasin : ${magasinNom}`;
      const body = `Bonjour,\n\nNous souhaitons discuter de votre magasin ${magasinNom}.\n\nCordialement, \nL'équipe Magmate`;

      // Appel à l'API backend pour envoyer l'email
      await firstValueFrom(this.http.post('http://localhost:3000/mail/send-contact-email', {
        to: proprietaireEmail,
        subject: subject,
        body: body
      }));

      alert(`Email envoyé avec succès à ${proprietaireEmail} concernant le magasin ${magasinNom}.`);
      this.errorMessage = null; // Efface toute erreur précédente
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email via l\'API:', error);
      this.errorMessage = 'Échec de l\'envoi de l\'email. Veuillez réessayer.';
    }
  }
}