
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminStatsService {
  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getMarketplaceMagasinCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/magasins/count`);
  }

  getMarketplaceProductCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/produits/count`);
  }

  getEventsCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/events/count`);
  }

  getPrestataireCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/prestataires/count`);
  }

  getUsersCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/user/count`);
  }



  getMarketplaceProductsByStore(): Observable<{ storeName: string; productCount: number }[]> {

    return this.http.get<{ storeName: string; productCount: number }[]>(`${this.baseUrl}/produits/stats/by-store`);
  }

getMarketplaceStoresByStatus(): Observable<{ estApprouve: string; count: number }[]> {
    return this.http.get<{ estApprouve: string; count: number }[]>(`${this.baseUrl}/magasins/stats/by-status`);
}

getEventsByType(): Observable<{ type: string; count: number }[]> {
    return this.http.get<{ type: string; count: number }[]>(`${this.baseUrl}/events/stats/by-type`);
}

  getEventsByStatus(): Observable<{ status: string; count: number }[]> {

    return this.http.get<{ status: string; count: number }[]>(`${this.baseUrl}/events/stats/by-status`);
  }

  getPrestatairesBySpeciality(): Observable<{ speciality: string; count: number }[]> {

    return this.http.get<{ speciality: string; count: number }[]>(`${this.baseUrl}/prestataires/stats/by-speciality`);
  }

getPrestatairesByStatus(): Observable<{ estApprouve: string; count: number }[]> {
    return this.http.get<{ estApprouve: string; count: number }[]>(`${this.baseUrl}/prestataires/stats/by-status`);
}
  getUsersByRole(): Observable<{ role: string; count: number }[]> {

    return this.http.get<{ role: string; count: number }[]>(`${this.baseUrl}/user/stats/by-role`);
  }
}