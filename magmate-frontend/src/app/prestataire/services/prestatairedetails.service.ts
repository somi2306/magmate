// src/app/services/prestatairedetails.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // <-- IMPORT AJOUTÉ

@Injectable({
  providedIn: 'root',
})
export class PrestatairedetailsService {
  private API_URL = `${environment.apiUrl}/prestataires`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer les détails d'un prestataire par UUID
   * @param uuid - UUID du prestataire
   * @returns Observable avec les informations du prestataire
   */
  getPrestataireByUuid(uuid: string): Observable<any> {
    return this.http.get(`${this.API_URL}/${uuid}`);
  }
}