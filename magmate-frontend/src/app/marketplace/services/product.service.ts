import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // <-- IMPORT AJOUTÉ

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/produits`;

  constructor(private http: HttpClient) { }

  // Méthode pour créer un produit
  createProduct(product: FormData): Observable<any> {
    return this.http.post(this.apiUrl, product);
  }

  // Méthode pour récupérer la liste des magasins
  getMagasins(): Observable<any[]> {
    // Utilisation de environment.apiUrl pour l'endpoint magasins
    return this.http.get<any[]>(`${environment.apiUrl}/magasins`);
  }

  // Méthode pour modifier un produit
  updateProduct(id: number, productData: FormData): Observable<any> {
    productData.forEach((value, key) => {
      console.log(key, value);
    });
    return this.http.put(`${this.apiUrl}/${id}`, productData);
  }

  getProductById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Méthode pour supprimer un produit
  deleteProduct(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${productId}`);
  }
}