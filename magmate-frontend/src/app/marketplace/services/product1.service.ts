import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // Import environnement
import { Produit } from '../models/produit.model'; 

@Injectable({
  providedIn: 'root'
})
export class ProductService1 {
  private apiUrl = `${environment.apiUrl}/produits`;

  constructor(private http: HttpClient) {}

  getProductById(id: number): Observable<Produit> {
    console.log('Appel API à:', `${this.apiUrl}/${id}`);
    return this.http.get<Produit>(`${this.apiUrl}/${id}`);
  }
}