// bard/prestataire frontend/services/comment-prestataire.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommentPrestataire } from '../models/comment-prestataire.model'; //
import { CreateCommentDto } from '../dto/create-comment.dto'; //

@Injectable({
  providedIn: 'root',
})
export class CommentPrestataireService {
  private readonly API_URL = 'http://localhost:3000/prestataires/comments'; //

  constructor(private http: HttpClient) {} //

  /**
   * Ajouter un commentaire pour un prestataire
   * @param createCommentDto Les données du commentaire
   */
  addComment(createCommentDto: CreateCommentDto): Observable<CommentPrestataire> { //
    return this.http.post<CommentPrestataire>(this.API_URL, createCommentDto); //
  }

  /**
   * Récupérer les commentaires d'un prestataire
   * @param prestataireId L'ID du prestataire
   */
  getComments(prestataireId: string): Observable<CommentPrestataire[]> { //
    return this.http.get<CommentPrestataire[]>(`${this.API_URL}/${prestataireId}`); //
  }

  /**
   * Supprimer un commentaire par son ID
   * @param commentId L'ID du commentaire à supprimer
   */
  deleteComment(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${commentId}`);
  }
}