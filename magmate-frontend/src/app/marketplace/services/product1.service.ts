// src/app/marketplace/services/product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';  // URL de base de l'API
import { Produit } from '../models/produit.model'; 
// product1.service.ts
@Injectable({
  providedIn: 'root'
})
export class ProductService1 {
  // CORRECTION : Utiliser directement l'URL complète
  private apiUrl = 'http://localhost:3000/produits';  // Notez le 'produits' sans 's' à la fin

  constructor(private http: HttpClient) {}

  getProductById(id: number): Observable<Produit> {
    console.log('Appel API à:', `${this.apiUrl}/${id}`); // Ajouter un log
    return this.http.get<Produit>(`${this.apiUrl}/${id}`);
  }
}
