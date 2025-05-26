import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Event, CreateEventDto, UpdateEventDto } from './event.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  private apiUrl = `${environment.apiUrl}/events`;

  constructor(private http: HttpClient) {}

  // Récupérer tous les événements avec filtres optionnels
  getAllEvents(filters?: {
    city?: string;
    type?: string;
  }): Observable<Event[]> {
    console.log('teest');
    let params = new HttpParams();

    if (filters?.city) {
      params = params.set('city', filters.city);
    }

    if (filters?.type) {
      params = params.set('type', filters.type);
    }

    return this.http.get<Event[]>(this.apiUrl, { params });
  }

  // Récupérer un événement par son ID
  getEventById(id: string): Observable<Event> {
    console.log('Event ID:', id);
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  // Récupérer les événements créés par l'utilisateur connecté
  getMyEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/my-events`);
  }

  // Créer un nouvel événement
  createEvent(eventData: FormData): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, eventData);
  }

  // Mettre à jour un événement
  updateEvent(id: string, eventData: FormData): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, eventData);
  }

  // Supprimer un événement
  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Ajouter un événement aux favoris
  addToFavorites(eventId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${eventId}/favorite`, {});
  }

  // Récupérer les événements favoris de l'utilisateur connecté
  getFavorites(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/my-favorites`);
  }

  // Supprimer un événement des favoris
  removeFromFavorites(eventId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${eventId}/favorite`);
  }
  
}
