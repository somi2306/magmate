import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// Nouvelle énumération pour le statut du prestataire (doit correspondre au backend)
export enum PrestataireStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export interface CreatePrestataireDto {
  specialite: string;
  experience: string;
  localisation: string;
  telephone: string;
  ville: string;
  disponibilite?: boolean;
}

export interface UpdatePrestataireDto extends Partial<CreatePrestataireDto> {
  estApprouve?: PrestataireStatus; // Ajout du statut pour la mise à jour si nécessaire
}

export interface Prestataire {
  idPrestataire: string;
  specialite: string;
  experience: string;
  localisation: string;
  telephone: string;
  ville: string;
  disponibilite: boolean;
  estApprouve: PrestataireStatus; // Utilisation de l'énumération
  idUtilisateur: string;
  utilisateur?: { // Ajoutez les infos de l'utilisateur si elles sont eager-loaded
    id: string;
    email: string;
    fname: string;
    lname: string;
    photo?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class PrestataireService {
  private baseUrl = 'http://localhost:3000/prestataires';

  constructor(private http: HttpClient,) {}

  getAllPrestataires(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getPrestataires(query?: string, ville?: string) {
    const params: any = {};

    if (query && query.trim() !== '') {
      params.query = query;
    }
    if (ville && ville.trim() !== '') {
      params.ville = ville;
    }

    return this.http.get<any[]>(`http://localhost:3000/prestataires`, {
      params
    });

  }
  getUuidByEmail(email: string): Observable<{ uuid: string }> {
    return this.http.get<{ uuid: string }>(`http://localhost:3000/user/uuid-by-email?email=${email}`);
  }
  isPrestataire(uuid: string): Observable<boolean> {
    return this.http.get<boolean>(`http://localhost:3000/prestataires/is-prestataire?uuid=${uuid}`);
  }
  getPrestataireByUuid(uuid: string): Observable<Prestataire | null> {
    return this.http.get<Prestataire | null>(`http://localhost:3000/prestataires/${uuid}`);
  }
  updateDisponibilite(id: string, disponibilite: boolean) { // Change id to string
    return this.http.patch(`${this.baseUrl}/${id}/disponibilite`, { disponibilite });
  }
  getByUuid(uuid: string): Observable<Prestataire> {
    return this.http.get<Prestataire>(`${this.baseUrl}/uuid/${uuid}`);
  }

  create(dto: CreatePrestataireDto): Observable<Prestataire> {
    return this.http.post<Prestataire>(this.baseUrl, dto);
  }

  getMe(): Observable<Prestataire> {
    return this.http.get<Prestataire>(`${this.baseUrl}/me`);
  }
  getMe2(uuid: string): Observable<Prestataire> {
    return this.http.get<Prestataire>(`${this.baseUrl}/me/${uuid}`);
  }

  update(id: string, dto: UpdatePrestataireDto): Observable<Prestataire> {
    return this.http.put<Prestataire>(`${this.baseUrl}/${id}`, dto);
  }


  delete(): Observable<any> {
    return this.http.delete(`${this.baseUrl}/me`);
  }
  deletePrestataire(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
  createWithUuid(dto: CreatePrestataireDto, uuid: string): Observable<Prestataire> {
    return this.http.post<Prestataire>(`${this.baseUrl}/create-with-uuid/${uuid}`, dto);
  }

  // Nouvelle méthode pour récupérer les prestataires par statut
  getPrestatairesByStatus(status: PrestataireStatus): Observable<Prestataire[]> {
    return this.http.get<Prestataire[]>(`${this.baseUrl}/status/${status}`);
  }

  getPendingPrestataires(): Observable<Prestataire[]> {
    return this.getPrestatairesByStatus(PrestataireStatus.PENDING);
  }

  getApprovedPrestataires(): Observable<Prestataire[]> {
    return this.getPrestatairesByStatus(PrestataireStatus.APPROVED);
  }

  getRejectedPrestataires(): Observable<Prestataire[]> {
    return this.getPrestatairesByStatus(PrestataireStatus.REJECTED);
  }

  // Méthodes pour approuver et rejeter
  approvePrestataire(idPrestataire: string): Observable<Prestataire> {
    return this.http.patch<Prestataire>(`${this.baseUrl}/${idPrestataire}/approve`, {});
  }

  rejectPrestataire(idPrestataire: string): Observable<Prestataire> {
    return this.http.patch<Prestataire>(`${this.baseUrl}/${idPrestataire}/reject`, {});
  }
}