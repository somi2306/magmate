import { Component, OnInit } from '@angular/core';
import { EventsService } from '../events.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-favorites',
  templateUrl: './my-favorites.component.html',
  styleUrls: ['./my-favorites.component.css'],
  standalone: false,
})
export class MyFavoritesComponent implements OnInit {
  favorites: any[] = [];

  constructor(private eventsService: EventsService, private router: Router) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.eventsService.getFavorites().subscribe({
      next: (data) => this.favorites = data,
      error: (err) => console.error(err)
    });
  }

  viewEventDetails(eventId: string): void {
    this.router.navigate(['/events', eventId]);
  }

  toggleFavorite(event: any, e: MouseEvent): void {
    e.stopPropagation();

    if (this.favorites.some(fav => fav.id === event.id)) {
      this.eventsService.removeFromFavorites(event.id).subscribe({
        next: () => {
          this.loadFavorites();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du favori', error);
        }
      });
    } else {
      this.eventsService.addToFavorites(event.id).subscribe({
        next: () => {
          this.loadFavorites();
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout aux favoris', error);
        }
      });
    }
  }
  goBack(): void {
  this.router.navigate(['/events']); // Redirige vers la liste des événements
}
}