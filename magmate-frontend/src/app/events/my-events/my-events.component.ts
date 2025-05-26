import { Component, OnInit } from '@angular/core';
import { EventsService } from '../events.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-my-events',
  templateUrl: './my-events.component.html',
  styleUrls: ['./my-events.component.css'],
  standalone: false,
})
export class MyEventsComponent implements OnInit {
  myEvents: any[] = [];
  isLoading: boolean = true;

  constructor(private eventsService: EventsService, private router: Router) {}

  ngOnInit(): void {
    this.loadMyEvents();
  }

  loadMyEvents(): void {
    this.eventsService.getMyEvents().subscribe(
      (data) => {
        this.myEvents = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Erreur lors du chargement des événements :', error);
        this.isLoading = false;
      }
    );
  }

editEvent(eventId: string): void {
  this.router.navigate([`/events/edit/${eventId}`]);
}

 deleteEvent(eventId: string): void {
  console.log('Tentative de suppression de l\'événement avec ID :', eventId);
  if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
    this.eventsService.deleteEvent(eventId).subscribe({
      next: () => {
        console.log('Événement supprimé avec succès');
        this.myEvents = this.myEvents.filter((event) => event.id !== eventId);
        alert('Événement supprimé avec succès !');
      },
      error: (error) => {
        console.error('Erreur lors de la suppression de l\'événement :', error);
        alert('Une erreur est survenue lors de la suppression.');
      },
    });
  }
}
returnmyEvent(): void {
  this.router.navigate(['/events/my']);
}
goBack(): void {
  this.router.navigate(['/events']); // Redirige vers la liste des événements
}
}
