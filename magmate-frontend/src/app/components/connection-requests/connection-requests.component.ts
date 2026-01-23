import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConnectionProfileService } from '../connection-profile/connection-profile.service';
import { AuthService } from '../../auth/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-connection-requests',
  templateUrl: './connection-requests.component.html',
  styleUrls: ['./connection-requests.component.css'],
  standalone: false
})
export class ConnectionRequestsComponent implements OnInit, OnDestroy {
  receivedRequests: any[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  currentUserId: string | null = null;
  private refreshInterval: any;

  constructor(
    private connectionService: ConnectionProfileService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    await this.loadInitialData();
    this.setupAutoRefresh();
  }

  ngOnDestroy() {
    this.clearAutoRefresh();
  }

  private async loadInitialData() {
    try {
      this.currentUserId = await this.authService.getUserIdByToken();
      if (!this.currentUserId) throw new Error("Utilisateur non identifié");
      await this.loadRequests();
    } catch (err: any) {
      this.handleError(err);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadRequests() {
    try {
      const allRequests = await firstValueFrom(
        this.connectionService.getReceivedRequests()
      );
      
      // Filtrer pour ne garder que les demandes où currentUserId est le receiver ET le statut est pending
      this.receivedRequests = allRequests.filter(request => 
        request.receiver.id === this.currentUserId && 
        request.status === 'pending'
      );
    } catch (err) {
      console.error('Erreur chargement demandes:', err);
    }
  }

  async respondToRequest(requestId: number, status: 'accepted' | 'rejected') {
    try {
      this.isLoading = true;
      this.error = null;

      // Suppression immédiate de la demande de la liste (optimistic UI)
      this.receivedRequests = this.receivedRequests.filter(r => r.id !== requestId);
      
      // Envoi de la réponse au backend
      await firstValueFrom(
        this.connectionService.respondToUserRequest(requestId, status)
      ).catch(err => {
        console.error('Erreur réponse:', err);
        // Si erreur, on pourrait éventuellement réafficher la demande
      });
      
    } catch (err: any) {
      console.error('Erreur inattendue:', err);
      this.error = err.error?.message || err.message || 'Erreur inconnue';
    } finally {
      this.isLoading = false;
    }
  }

  private updateRequestStatus(requestId: number, status: string) {
    const request = this.receivedRequests.find(r => r.id === requestId);
    if (request) {
      request.status = status;
    }
  }

  private handleResponseError(error: any, requestId: number) {
    console.error('Erreur réponse:', error);
    this.error = error.error?.message || error.message || 'Erreur inconnue';

    // Annulation de la mise à jour optimiste
    const originalRequest = this.receivedRequests.find(r => r.id === requestId);
    if (originalRequest) {
      originalRequest.status = 'pending';
    }
  }

  private handleError(error: any) {
    console.error('Erreur:', error);
    this.error = error.message || 'Erreur de chargement';
  }

  private setupAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      if (!this.isLoading) this.loadRequests();
    }, 1000); // 30 secondes
  }

  private clearAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  getStatusClass(status: string): string {
    return {
      'pending': 'badge bg-warning text-dark',
      'accepted': 'badge bg-success',
      'rejected': 'badge bg-danger'
    }[status] || 'badge bg-secondary';
  }
}