import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Produit {
  idProduit: number;
  titre: string;
  description: string;
  prix: number;
  imagePrincipale: string;
  dateAjout: string;
  magasinIdMagasin: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private baseUrl = `${environment.apiUrl}/produits`;

  constructor(private http: HttpClient) {}

  getProduits(search?: string, ville?: string): Observable<Produit[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (ville) params = params.set('ville', ville);

    return this.http.get<Produit[]>(this.baseUrl, { params });
  }

  getProduitsByMagasin(magasinId: number): Observable<Produit[]> {
    // Utilisation de environment.apiUrl pour l'endpoint magasins
    return this.http.get<Produit[]>(`${environment.apiUrl}/magasins/${magasinId}/produits`);
  }
  
  getProductById(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.baseUrl}/${id}`);
  } 

  deleteProduct(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${productId}`);
  }
}