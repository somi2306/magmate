import { Component, OnInit,OnDestroy  } from '@angular/core';
import { ConnectionProfileService } from '../connection-profile/connection-profile.service';
import { AuthService } from '../../auth/auth.service';
import { firstValueFrom } from 'rxjs';
import { UserProfile } from '../connection-profile/connection-profile.model';

@Component({
  selector: 'app-connection-send',
  templateUrl: './connection-send.component.html',
  styleUrls: ['./connection-send.component.css'],
  standalone: false
})
export class ConnectionSendComponent implements OnInit,OnDestroy {
  specificUserId = '44d85939-a404-472d-94a0-92cf60f04813';
  currentUserProfile!: UserProfile;
  specificUserProfile!: UserProfile;
  requestStatus: string = 'not-sent';
  error: string | null = null;
  isLoading: boolean = true;
  currentRequestId: number | null = null;
private statusCheckInterval: any;
  constructor(
    private connectionService: ConnectionProfileService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    // Charger l'état depuis le localStorage si disponible
    this.loadStateFromStorage();

    try {
      const currentUserId = await this.authService.getUserIdByToken();

      if (!currentUserId) {
        throw new Error("Impossible de récupérer l'utilisateur courant.");
      }

      const [currentProfile, specificProfile] = await Promise.all([
        this.connectionService.getSpecificUserProfile(currentUserId),
        this.connectionService.getSpecificUserProfile(this.specificUserId)
      ]);

      this.currentUserProfile = currentProfile;
      this.specificUserProfile = specificProfile;

      // Vérifier le statut actuel depuis le serveur
      await this.checkRequestStatus();

    } catch (err: any) {
      this.error = err.message || 'Erreur lors du chargement des profils';
    } finally {
      this.isLoading = false;
    }
  }

  ngOnDestroy() {
    // Nettoyer l'intervalle lorsque le composant est détruit
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
    }
  }
  private startStatusChecking() {
    // Vérifier le statut toutes les 10 secondes
    this.statusCheckInterval = setInterval(async () => {
      await this.checkRequestStatus();
    }, 1000);
  }
  
  private loadStateFromStorage() {
    const savedState = localStorage.getItem(`connectionState_${this.specificUserId}`);
    if (savedState) {
      const state = JSON.parse(savedState);
      this.requestStatus = state.requestStatus;
      this.currentRequestId = state.currentRequestId;
    }
  }

  private saveStateToStorage() {
    const state = {
      requestStatus: this.requestStatus,
      currentRequestId: this.currentRequestId
    };
    localStorage.setItem(`connectionState_${this.specificUserId}`, JSON.stringify(state));
  }

  async checkRequestStatus() {
    try {
      const response = await firstValueFrom(
        this.connectionService.getUserRequestStatus(this.specificUserId)
      );
      
      // Mettre à jour l'état seulement si différent
      if (this.requestStatus !== response.status) {
        this.requestStatus = response.status;
        this.saveStateToStorage();
      }
      
      if (response.status === 'waiting-for-current-user-response') {
        await this.findCurrentRequestId();
      }
    } catch (err) {
      console.error('Erreur lors de la vérification du statut:', err);
    }
  }

  async findCurrentRequestId() {
    try {
      const requests = await firstValueFrom(
        this.connectionService.getReceivedRequests()
      );
      const request = requests.find(r => 
        r.creator.id === this.specificUserId && 
        r.receiver.id === this.currentUserProfile.id
      );
      if (request && this.currentRequestId !== request.id) {
        this.currentRequestId = request.id;
        this.saveStateToStorage();
      }
    } catch (err) {
      console.error('Erreur lors de la recherche de la demande:', err);
    }
  }

  async sendRequest() {
    this.isLoading = true;
    this.error = null;

    try {
      if (this.requestStatus === 'not-sent') {
        const response = await firstValueFrom(
          this.connectionService.sendUserRequest(this.specificUserId)
        );
        
        if (response && (response as any).error) {
          throw new Error((response as any).error);
        }
        
        // Vérifier immédiatement le nouveau statut
        await this.checkRequestStatus();
      }
    } catch (err: any) {
      this.error = err.message || "Échec de l'envoi de la demande";
    } finally {
      this.isLoading = false;
    }
  }

  async respondToRequest(status: string) {
    if (!this.currentRequestId) return;

    this.isLoading = true;
    try {
      await firstValueFrom(
        this.connectionService.respondToUserRequest(this.currentRequestId, status)
      );
      
      // Vérifier immédiatement le nouveau statut
      await this.checkRequestStatus();
    } catch (err: any) {
      this.error = err.message || "Échec de la réponse à la demande";
    } finally {
      this.isLoading = false;
    }
  }

  getStatusMessage(): string {
    switch (this.requestStatus) {
      case 'not-sent': return 'Aucune demande envoyée';
      case 'pending': return 'Demande envoyée - En attente de réponse';
      case 'accepted': return 'Vous êtes connectés';
      case 'rejected': return 'Demande refusée';
      case 'waiting-for-current-user-response': 
        return 'Cet utilisateur vous a envoyé une demande';
      default: return 'Statut inconnu';
    }
  }
}