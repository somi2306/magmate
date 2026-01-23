// src/app/services/magasin.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // <-- IMPORT AJOUTÉ

@Injectable({
  providedIn: 'root',
})
export class MagasinService {
  private baseUrl = `${environment.apiUrl}/magasins`;

  constructor(private http: HttpClient) {}

  // Méthode pour récupérer un magasin par userId
  getMagasinByUser(userId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${userId}`);
  }

  getMagasinById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  deleteMagasin(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getUuidByEmail(email: string): Observable<{ uuid: string }> {
    // Utilisation de environment.apiUrl pour l'endpoint user
    return this.http.get<{ uuid: string }>(`${environment.apiUrl}/user/uuid-by-email?email=${email}`);
  }
}