import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { AuthService } from '../../auth/auth.service'; 
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ConnectionProfileService {
  private API = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Nouvelle méthode pour récupérer un profil spécifique
  getSpecificUserProfile(userId: string): Promise<any> {
    return firstValueFrom(this.http.get(`${this.API}/user/profile/${userId}`));
  }

  sendUserRequest(receiverId: string): Observable<any> {
    return this.http.post(`${this.API}/user/send/${receiverId}`, {});
  }

  getUserRequestStatus(receiverId: string): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(`${this.API}/user/send/status/${receiverId}`);
  }

  respondToUserRequest(userRequestId: number, status: string): Observable<any> {
    return this.http.put(`${this.API}/user/send/response/${userRequestId}`, { status });
  }

  getReceivedRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/user/send/me/received-requests`);
  }
}