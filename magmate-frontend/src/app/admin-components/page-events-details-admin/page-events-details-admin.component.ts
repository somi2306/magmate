import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; // Import Router
import { EventsService } from '../../events/events.service';
import { Event } from '../../events/event.model';
import { firstValueFrom } from 'rxjs'; // Import firstValueFrom

@Component({
  selector: 'app-page-events-details-admin',
  templateUrl: './page-events-details-admin.component.html',
  styleUrls: ['./page-events-details-admin.component.css'],
  standalone: false,
})
export class PageEventsDetailsAdminComponent implements OnInit {
  eventId!: string;
  event!: Event;
  errorMessage: string | null = null;
  isLoading: boolean = true;
  modalImageUrl: string | null = null; // Pour l'affichage de l'image en grand

  constructor(
    private route: ActivatedRoute,
    private eventsService: EventsService,
    private router: Router // Injection du Router
  ) {}

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id')!;
    if (this.eventId) {
      this.loadEventDetails();
    } else {
      this.errorMessage = 'ID de l\'événement non fourni.';
      this.isLoading = false;
    }
  }

  loadEventDetails(): void {
    this.eventsService.getEventById(this.eventId).subscribe({
      next: (data: Event) => {
        this.event = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des détails de l\'événement:', error);
        this.errorMessage = 'Impossible de charger les détails de l\'événement. Veuillez réessayer plus tard.';
        this.isLoading = false;
      }
    });
  }

  // Méthode pour revenir à la page précédente
  goBack(): void {
    this.router.navigate(['/admin/events']); // Redirige vers la liste des événements pour l'admin
  }

  // Méthode pour ouvrir l'image en mode modal
  openImageModal(url: string) {
    this.modalImageUrl = url;
  }

  // Méthode pour fermer l'image en mode modal
  closeImageModal() {
    this.modalImageUrl = null;
  }

  // Méthode pour supprimer un événement (pour l'admin)
  async deleteEvent(eventId: string): Promise<void> {
    if (confirm('Nous sommes-nous sûrs de vouloir supprimer cet événement ? Cette action est irréversible.')) {
      try {
        // Appeler le service pour supprimer l'événement
        await firstValueFrom(this.eventsService.deleteEvent(eventId)); // L'email de l'admin n'est pas utilisé pour la suppression sur le backend, mais l'API l'exige.
        alert('Événement supprimé avec succès ✅');
        this.router.navigate(['/admin/events']); // Rediriger après suppression
      } catch (error: any) {
        console.error('Erreur lors de la suppression de l\'événement :', error);
        this.errorMessage = error.message || 'Erreur lors de la suppression de l\'événement ❌';
      }
    }
  }
}