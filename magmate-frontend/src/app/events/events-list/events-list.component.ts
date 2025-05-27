import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { EventsService } from '../events.service';
import { Event, EventType } from '../event.model';

@Component({
  selector: 'app-events-list',
  templateUrl: './events-list.component.html',
  styleUrls: ['./events-list.component.css'],
  standalone: false,
})
export class EventsListComponent implements OnInit {
  events: Event[] = [];
  allEvents: Event[] = [];
  favorites: Set<string> = new Set();
  filterForm: FormGroup;
  eventTypes = Object.values(EventType);
  isLoading = false;
  cities: string[] = [];
  isAuthenticated = true;

  constructor(
    private eventsService: EventsService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      city: [''],
      type: [''],
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    console.log('Événements  :');
    


    this.eventsService.getAllEvents().subscribe({
      next: (events) => {
        console.log('helo');
        this.allEvents = events;
        this.events = events;
        this.extractCities();

        console.log('Événements chargés :');
        // Vérifie si l'utilisateur est authentifié AVANT de charger les favoris
        
            this.eventsService.getFavorites().subscribe({
              next: (favorites) => {
                this.favorites = new Set(favorites.map((event) => event.id));
                this.isLoading = false;
              },
              error: () => {
                console.error('Erreur lors de la récupération des événements');

                this.isLoading = false;
              },
            });
          
        
      },
      error: () => {
        this.isLoading = false;
      },
    });

    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  loadEvents(): void {
    this.isLoading = true;
    this.eventsService.getAllEvents().subscribe({
      next: (events) => {
        console.log('Événements chargés :', events);
        this.allEvents = events;
        this.events = events;
        this.extractCities();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des événements', error);
        this.isLoading = false;
      },
    });
  }

  loadFavorites(): void {
    this.eventsService.getFavorites().subscribe({
      next: (favorites) => {
        this.favorites = new Set(favorites.map((event) => event.id));
      },
      error: (error) => {
        console.error('Erreur lors du chargement des favoris', error);
      },
    });
  }

  extractCities(): void {
    const uniqueCities = new Set(this.events.map((event) => event.city));
    this.cities = Array.from(uniqueCities);
  }

  applyFilters(): void {
    if (this.isLoading || !this.allEvents.length) {
      return;
    }
    const { searchTerm, city, type } = this.filterForm.value;
    let filters: any = {};
    if (city) filters.city = city;
    if (type) filters.type = type;

    if (city || type) {
      this.eventsService.getAllEvents(filters).subscribe({
        next: (events) => {
          this.events = events.filter(
            (event) =>
              !searchTerm ||
              event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              event.description.toLowerCase().includes(searchTerm.toLowerCase())
          );
        },
      });
    } else {
      // Pas de filtre, on affiche tout
      this.events = this.allEvents.filter(
        (event) =>
          !searchTerm ||
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  }
  resetFilters(): void {
    this.filterForm.reset();
    this.events = this.allEvents;
  }

  toggleFavorite(event: Event, e: MouseEvent): void {
    if (!this.isAuthenticated) {
      console.log('Utilisateur non authentifié');
      this.router.navigate(['/login']);
      return;
    }
    e.stopPropagation();
    if (this.favorites.has(event.id)) {
      this.eventsService.removeFromFavorites(event.id).subscribe({
        next: () => {
          this.loadFavorites();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du favori', error);
        },
      });
    } else {
      this.eventsService.addToFavorites(event.id).subscribe({
        next: () => {
          this.loadFavorites();
        },
        error: (error) => {
          console.error("Erreur lors de l'ajout aux favoris", error);
        },
      });
    }
  }

  isFavorite(eventId: string): boolean {
    return this.favorites.has(eventId);
  }

  viewEventDetails(eventId: string): void {
    this.router.navigate(['/events', eventId]);
  }

  createEvent(): void {
    this.router.navigate(['/events/create']);
  }

  returnmyEvent(): void {
    window.location.href = '/events/my-events';
  }
}
