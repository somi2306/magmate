// Fichier : bard/admin-components/admin-events-list/admin-events-list.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { EventsService } from '../../events/events.service';
import { Event, EventStatus } from '../../events/event.model';
import { Router } from '@angular/router';
import { ConnectionProfileService } from '../../components/connection-profile/connection-profile.service';
import { AuthService } from '../../auth/auth.service';
import { firstValueFrom } from 'rxjs';
import { UserProfile } from '../../components/connection-profile/connection-profile.model';
import { HttpClient } from '@angular/common/http'; // Pour envoyer des emails

@Component({
  selector: 'app-admin-events-list',
  standalone: false,
  templateUrl: './admin-events-list.component.html',
  styleUrls: ['./admin-events-list.component.css']
})
export class AdminEventsListComponent implements OnInit {
  pendingEvents: Event[] = [];
  approvedEvents: Event[] = [];
  rejectedEvents: Event[] = [];
  activeTab: 'pending' | 'approved' | 'rejected' = 'pending';
  errorMessage: string | null = null;

  currentUserProfile!: UserProfile;
  isLoadingConnection: boolean = false;

  constructor(
    private eventsService: EventsService,
    private router: Router,
    private authService: AuthService,
    private connectionService: ConnectionProfileService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient // Injection de HttpClient
  ) { }

  ngOnInit(): void {
    this.loadAllEvents();
  }

  loadAllEvents(): void {
    this.loadEventsByStatus(EventStatus.PENDING, 'pending');
    this.loadEventsByStatus(EventStatus.APPROVED, 'approved');
    this.loadEventsByStatus(EventStatus.REJECTED, 'rejected');
  }

  loadEventsByStatus(status: EventStatus, targetArray: 'pending' | 'approved' | 'rejected'): void {
    // Changement ici : Utiliser la nouvelle méthode getEventsByStatus
    this.eventsService.getEventsByStatus(status).subscribe({
      next: (data: Event[]) => {
        if (targetArray === 'pending') {
          this.pendingEvents = data;
        } else if (targetArray === 'approved') {
          this.approvedEvents = data;
        } else {
          this.rejectedEvents = data;
        }
      },
      error: (error) => this.handleError(error)
    });
  }

  handleError(error: any): void {
    console.error('Erreur:', error);
    this.errorMessage = 'Erreur lors du chargement des données.';
  }

  async approveEvent(eventId: string): Promise<void> {
    try {
      const eventToUpdate = [...this.pendingEvents, ...this.approvedEvents, ...this.rejectedEvents]
                              .find(e => e.id === eventId);
      if (!eventToUpdate || !eventToUpdate.createdBy?.email || !eventToUpdate.createdBy?.fname || !eventToUpdate.createdBy?.lname) {
        throw new Error('Informations de l\'événement ou du créateur manquantes pour l\'email.');
      }

      await firstValueFrom(this.eventsService.approveEvent(eventId));
      await this.sendApprovalEmail(
        eventToUpdate.createdBy.email,
        `${eventToUpdate.createdBy.fname} ${eventToUpdate.createdBy.lname}`,
        eventToUpdate.title,
        true
      );
      alert('Événement approuvé avec succès ✅');
      this.loadAllEvents();
      this.errorMessage = null;
    } catch (error: any) {
      console.error('Erreur lors de l\'approbation de l\'événement:', error);
      this.errorMessage = error.message || 'Erreur lors de l\'approbation.';
    }
  }

  async rejectEvent(eventId: string): Promise<void> {
    try {
      const eventToUpdate = [...this.pendingEvents, ...this.approvedEvents, ...this.rejectedEvents]
                              .find(e => e.id === eventId);
      if (!eventToUpdate || !eventToUpdate.createdBy?.email || !eventToUpdate.createdBy?.fname || !eventToUpdate.createdBy?.lname) {
        throw new Error('Informations de l\'événement ou du créateur manquantes pour l\'email.');
      }

      await firstValueFrom(this.eventsService.rejectEvent(eventId));
      await this.sendApprovalEmail(
        eventToUpdate.createdBy.email,
        `${eventToUpdate.createdBy.fname} ${eventToUpdate.createdBy.lname}`,
        eventToUpdate.title,
        false
      );
      alert('Événement rejeté avec succès ❌');
      this.loadAllEvents();
      this.errorMessage = null;
    } catch (error: any) {
      console.error('Erreur lors du rejet de l\'événement:', error);
      this.errorMessage = error.message || 'Erreur lors du rejet.';
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    if (confirm('Nous sommes-nous sûrs de vouloir supprimer cet événement ? Cette action est irréversible.')) {
      try {
        const eventToDelete = [...this.pendingEvents, ...this.approvedEvents, ...this.rejectedEvents]
                                .find(e => e.id === eventId);
        if (!eventToDelete || !eventToDelete.createdBy?.email || !eventToDelete.createdBy?.fname || !eventToDelete.createdBy?.lname) {
          throw new Error('Informations de l\'événement ou du créateur manquantes pour l\'email de suppression.');
        }

        await firstValueFrom(this.eventsService.deleteEvent(eventId));
        await this.sendDeletionEmail(
          eventToDelete.createdBy.email,
          `${eventToDelete.createdBy.fname} ${eventToDelete.createdBy.lname}`,
          eventToDelete.title
        );
        alert('Événement supprimé avec succès ✅');
        this.loadAllEvents();
        this.errorMessage = null;
      } catch (error: any) {
        console.error('Erreur lors de la suppression de l\'événement :', error);
        this.errorMessage = error.message || 'Erreur lors de la suppression de l\'événement ❌';
      }
    }
  }


  private async sendApprovalEmail(to: string, userName: string, eventTitle: string, isApproved: boolean): Promise<void> {
    try {
      const subject = isApproved
        ? `Votre événement "${eventTitle}" a été approuvé`
        : `Votre événement "${eventTitle}" n'a pas été approuvé`;

      const body = isApproved
        ? `Bonjour ${userName},\n\nNous sommes heureux de vous informer que votre événement "${eventTitle}" a été approuvé et est maintenant visible sur notre plateforme.\n\nCordialement,\nL'équipe Magmate`
        : `Bonjour ${userName},\n\nNous regrettons de vous informer que votre événement "${eventTitle}" n'a pas été approuvé pour figurer sur notre plateforme.\n\nPour plus d'informations, n'hésitez pas à nous contacter.\n\nCordialement,\nL'équipe Magmate`;

      await firstValueFrom(this.http.post('http://localhost:3000/mail/send-contact-email', {
        to: to,
        subject: subject,
        body: body
      }));

      console.log('Email envoyé avec succès à', to);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
    }
  }

  private async sendDeletionEmail(to: string, userName: string, eventTitle: string): Promise<void> {
    try {
      const subject = `Votre événement "${eventTitle}" a été supprimé`;
      const body = `Bonjour ${userName},\n\nNous vous informons que votre événement "${eventTitle}" a été supprimé de notre plateforme par un administrateur.\n\nPour toute question, n'hésitez pas à nous contacter.\n\nCordialement,\nL'équipe Magmate`;

      await firstValueFrom(this.http.post('http://localhost:3000/mail/send-contact-email', {
        to: to,
        subject: subject,
        body: body
      }));

      console.log('Email de suppression envoyé avec succès à', to);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de suppression:', error);
    }
  }

  async contactCreator(creatorId: string | undefined): Promise<void> {
    console.log('[DEBUG] Début de contactCreator()');
    console.log('[DEBUG] ID du créateur:', creatorId);

    if (!creatorId) {
      console.error('[ERROR] Créateur ID non trouvé');
      this.errorMessage = "Informations du créateur manquantes";
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
        this.connectionService.sendUserRequest(creatorId)
      );

      if (sendRequestResponse && (sendRequestResponse as any).error) {
        console.warn('[WARN] sendUserResponse a renvoyé une erreur, mais nous allons quand même tenter la redirection:', (sendRequestResponse as any).error);
      }

      console.log('[DEBUG] Tentative de redirection vers la messagerie avec recipientId:', creatorId);
      this.router.navigate(['/admin/messagerie'], {
        queryParams: { recipientId: creatorId }
      });

    } catch (err: any) {
      console.error('[ERROR] Erreur complète:', err);
      this.errorMessage = err.message || "Échec de l'opération de contact";
    } finally {
      this.isLoadingConnection = false;
      this.cdr.detectChanges();
    }
  }

  viewEventDetails(eventId: string): void {
    this.router.navigate(['/admin/event-details', eventId]);
  }
}