import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReclamationPrestataireService {
  private baseUrl = 'http://localhost:3000/prestataires/reclamations';

  constructor(private http: HttpClient) {}

  // MODIFICATION ICI : on accepte FormData (ou any) au lieu du DTO
  addReclamation(idPrestataire: string, data: FormData | any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${idPrestataire}`, data);
  }

  getAllReclamations(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }
}