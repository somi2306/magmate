// src/app/marketplace/services/product.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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
  private baseUrl = 'http://localhost:3000/produits';

  constructor(private http: HttpClient) {}

  getProduits(search?: string, ville?: string): Observable<Produit[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (ville) params = params.set('ville', ville);

    return this.http.get<Produit[]>(this.baseUrl, { params });
  }
  getProduitsByMagasin(magasinId: number): Observable<Produit[]> {
    return this.http.get<Produit[]>(`http://localhost:3000/magasins/${magasinId}/produits`);
  }
  getProductById(id: number): Observable<Produit> {
      return this.http.get<Produit>(`http://localhost:3000/produits/${id}`);
  
} 
deleteProduct(productId: number): Observable<void> {
  return this.http.delete<void>(`${this.baseUrl}/${productId}`);
}


}
