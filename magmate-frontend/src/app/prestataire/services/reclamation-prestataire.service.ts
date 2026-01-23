import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // <-- IMPORT AJOUTÉ

@Injectable({
  providedIn: 'root',
})
export class ReclamationPrestataireService {
  private baseUrl = `${environment.apiUrl}/prestataires/reclamations`;

  constructor(private http: HttpClient) {}

  // MODIFICATION ICI : on accepte FormData (ou any) au lieu du DTO
  addReclamation(idPrestataire: string, data: FormData | any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${idPrestataire}`, data);
  }

  getAllReclamations(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }
}