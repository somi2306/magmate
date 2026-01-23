import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
// import { CreateReclamationDto } from '../dto/create-reclamation.dto'; // Plus utilisé directement pour l'envoi de FormData
import { Reclamation } from '../models/reclamation.model';

@Injectable({
  providedIn: 'root'
})
export class ReclamationService {
  private apiUrl = environment.apiUrl + '/reclamations';  // URL de base pour les réclamations

  constructor(private http: HttpClient) {}

  // Méthode pour ajouter une réclamation pour un produit
  addReclamation(productId: number, reclamationData: FormData): Observable<any> {
      // Pour debugger le contenu de l'objet
      console.log('Données de réclamation:', reclamationData);

      return this.http.post(`${this.apiUrl}/${productId}`, reclamationData);
  }

  // NOUVELLE MÉTHODE : Récupérer toutes les réclamations (pour l'admin)
  getAllReclamations(): Observable<Reclamation[]> {
    return this.http.get<Reclamation[]>(this.apiUrl);
  }
}