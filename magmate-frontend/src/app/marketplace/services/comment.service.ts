// src/app/marketplace/services/comment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // URL de base de l'API
import { Avis } from '../models/avis.model';  // Modèle pour les commentaires
import { CreateAvisDto } from '../dto/create-avis.dto';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = environment.apiUrl + '/comments';  // URL de base pour les commentaires

  constructor(private http: HttpClient) {}

  // Méthode pour récupérer les commentaires d'un produit
  getCommentsByProductId(productId: number): Observable<Avis[]> {
    return this.http.get<Avis[]>(`${this.apiUrl}/${productId}`);  // Appel GET pour récupérer les commentaires
  }

  addComment(productId: number, commentData: CreateAvisDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/${productId}`, commentData);  // Envoie des données au backend
  }

  // Nouvelle méthode pour supprimer un commentaire par son ID
  deleteComment(commentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${commentId}`);
  }
}