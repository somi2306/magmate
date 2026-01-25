import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API = `${environment.apiUrl}/auth`;
  
  userLoggedIn = new EventEmitter<void>();

  constructor(
    private http: HttpClient,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  /* zineb */
  async getUserIdByToken(): Promise<string | null> {
    try {
      const token = localStorage.getItem('firebase_token');

      if (!token) {
        console.warn('Aucun token trouvé dans localStorage');
        return null;
      }

      // Utilisation de environment.apiUrl pour l'appel backend
      const response = await firstValueFrom(
        this.http.post<{ userId: string }>(
          `${environment.apiUrl}/auth/get-user-id-by-token`,
          { token }
        )
      );

      return response.userId;
    } catch (error) {
      //console.error('Erreur getUserIdByToken:', error);
      return null;
    }
  }

  // Nouvelle méthode pour obtenir l'ID utilisateur (UUID)
  async getUserId(): Promise<string | null> {
    const user = await this.afAuth.currentUser;

    if (user) {
      // Vérifie si l'UID est bien un UUID valide
      if (
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          user.uid
        )
      ) {
        return user.uid;
      }
      console.warn("UID utilisateur n'est pas un UUID valide:", user.uid);
    }
    return null;
  }

  /* zineb */

  async getIdToken(): Promise<string | null> {
    try {
      const user = await this.afAuth.currentUser;
      if (!user) {
        console.warn('Aucun utilisateur Firebase connecté');
        return null;
      }
      const token = await user.getIdToken();
      //console.log('Token Firebase:', token);
      localStorage.setItem('firebase_token', token);
      /*console.log(
        'Token stocké dans localStorage:',
        localStorage.getItem('firebase_token')
      );*/
      return token;
    } catch (error) {
      //console.error('Erreur getIdToken:', error);
      return null;
    }
  }

  async loginBackend() {
    const token = await this.getIdToken();
    //console.log('Firebase token:', token);
    const response: any = await firstValueFrom(
      this.http.post(`${this.API}/login`, { token })
    );
  
    if (response.twoFactorRequired) {
      return {
        twoFactorRequired: true,
        phoneNumber: response.phoneNumber,
        role: response.user?.role,
      };
    } else {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return { success: true, role: response.user.role };
    }
  }

  async signupBackend(fname: string, lname: string, password: string) {
    return firstValueFrom(
      this.http.post(`${this.API}/signup`, {
        token: await this.getIdToken(),
        fname,
        lname,
        password,
      })
    );
  }

  async logout(): Promise<void> {
    try {
      await this.afAuth.signOut();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('firebaseUser');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('firebaseUser');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  }

  isAuthenticated(): Promise<boolean> {
    console.log('Vérification de l’authentification en cours...');
    return firstValueFrom(
      this.afAuth.authState.pipe(
        map((user) => !!user)
      )
    );
  }

  deleteUser(id: string): Observable<any> {
    const token = localStorage.getItem('firebase_token');
    const headers = { Authorization: `Bearer ${token}` };
    // Utilisation de environment.apiUrl
    return this.http.delete(`${environment.apiUrl}/user/${id}`, { headers });
  }

  getAllUsers(): Observable<any[]> {
    const token = localStorage.getItem('firebase_token');
    const headers = { Authorization: `Bearer ${token}` };
    // Utilisation de environment.apiUrl
    return this.http.get<any[]>(`${environment.apiUrl}/user`, { headers });
  }
}