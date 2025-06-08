
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Magasin } from '../models/magasin.model'; // Importer le modèle Magasin

@Injectable({
  providedIn: 'root'
})
export class MagasinService {
  private apiUrl = 'http://localhost:3000/magasins'; // URL de l'API, assurez-vous qu'elle est correcte
  private productUrl = 'http://localhost:3000/produits'; // URL pour les produits

  constructor(private http: HttpClient) {}

  // Méthode pour créer un magasin
  createMagasin(magasinData: FormData): Observable<any> {
    console.log("Contenu de FormData:");
    magasinData.forEach((value, key) => {
      console.log(key, value);
    });
    
    return this.http.post(`${this.apiUrl}`, magasinData);
  }

  // Récupérer un magasin par son ID
  getMagasinById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Mettre à jour un magasin
  updateMagasin(id: number, magasinData: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, magasinData);
  }
  
  // Méthode pour supprimer un produit
  deleteProduct(productId: number): Observable<any> {
    return this.http.delete<any>(`${this.productUrl}/${productId}`);
  }

  getUuidByEmail(email: string): Observable<{ uuid: string }> {
    return this.http.get<{ uuid: string }>(`http://localhost:3000/user/uuid-by-email?email=${email}`);
  }

  // Approuver un magasin
  approveMagasin(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/approve`, {});
  }

  // Rejeter un magasin
  rejectMagasin(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}/reject`, {});
  }

  // Récupérer tous les magasins (non approuvés)
  /*getUnapprovedMagasins(): Observable<Magasin[]> {
    return this.http.get<Magasin[]>(`${this.apiUrl}?estApprouve=pending`); // C'est la ligne clé !
  }*/
 getMagasinsByStatus(status: string): Observable<Magasin[]> {
  return this.http.get<Magasin[]>(`${this.apiUrl}/status/${status}`);
}

// Garder l'ancienne méthode pour la compatibilité
getUnapprovedMagasins(): Observable<Magasin[]> {
    return this.http.get<Magasin[]>(`http://localhost:3000/magasins/status/pending`); // C'est la ligne clé !
  }
// Ajouter des méthodes pour les autres statuts
getApprovedMagasins(): Observable<Magasin[]> {
  return this.getMagasinsByStatus('approved');
}

getRejectedMagasins(): Observable<Magasin[]> {
  return this.getMagasinsByStatus('rejected');
}
}