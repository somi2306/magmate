import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventsService } from '../events.service';
import { Event } from '../event.model';
import { switchMap, takeUntil, Subject } from 'rxjs';

@Component({
  selector: 'app-event-details',
  templateUrl: './events-details.component.html',
  styleUrls: ['./events-details.component.css'],
  standalone: false,
})
export class EventsDetailsComponent implements OnInit {
  event: Event | null = null;
  isLoading = true;
  error = '';
  isCreator = false;
  isFavorite = false;
  modalImageUrl: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventsService: EventsService
  ) {}
 ngOnInit(): void {
    this.loadEventDetails();
    this.checkIfCreator();
    this.checkIfFavorite();
    

 }
  loadEventDetails(): void {
    const eventId = this.route.snapshot.paramMap.get('id');
    console.log('Event ID:', eventId);
    if (!eventId) {
      this.error = "Identifiant d'événement manquant";
      this.isLoading = false;
      return;
    }

    this.eventsService.getEventById(eventId).subscribe({
      next: (event) => {
        console.log('Event ID:', event);

        this.event = event;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = "Impossible de charger les détails de l'événement";
        this.isLoading = false;
        console.error("Erreur lors du chargement de l'événement", error);
      },
    });
  }

  checkIfFavorite(): void {
    if (!this.event) return;

    this.eventsService.getFavorites().subscribe({
      next: (favorites) => {
        this.isFavorite = favorites.some((fav) => fav.id === this.event?.id);
      },
      error: (error) => {
        console.error('Erreur lors de la vérification des favoris', error);
      },
    });
  }

  checkIfCreator(): void {
    if (!this.event) return;

    this.eventsService.getMyEvents().subscribe({
      next: (myEvents) => {
        this.isCreator = myEvents.some((e) => e.id === this.event?.id);
      },
      error: (error) => {
        console.error('Erreur lors de la vérification du créateur', error);
      },
    });
  }

  toggleFavorite(): void {
    if (!this.event) return;

    if (this.isFavorite) {
      this.eventsService.removeFromFavorites(this.event.id).subscribe({
        next: () => {
          this.isFavorite = false;
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du favori', error);
        },
      });
    } else {
      this.eventsService.addToFavorites(this.event.id).subscribe({
        next: () => {
          this.isFavorite = true;
        },
        error: (error) => {
          console.error("Erreur lors de l'ajout aux favoris", error);
        },
      });
    }
  }

  editEvent(): void {
    if (this.event) {
      this.router.navigate(['/events/edit', this.event.id]);
    }
  }

  deleteEvent(): void {
    if (!this.event) return;

    if (
      confirm(
        'Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.'
      )
    ) {
      this.eventsService.deleteEvent(this.event.id).subscribe({
        next: () => {
          this.router.navigate(['/events']);
        },
        error: (error) => {
          console.error("Erreur lors de la suppression de l'événement", error);
          alert(
            "Une erreur est survenue lors de la suppression de l'événement"
          );
        },
      });
    }
  }

  openImageModal(url: string) {
  this.modalImageUrl = url;
}

closeImageModal() {
  this.modalImageUrl = null;
}

  goBack(): void {
    this.router.navigate(['/events']);
  }
}
