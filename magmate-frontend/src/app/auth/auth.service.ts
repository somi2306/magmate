

import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


import { getAuth } from '@angular/fire/auth';

import { AngularFireAuth } from '@angular/fire/compat/auth';  // Utilisez AngularFireAuth
import { Router } from '@angular/router';
import { HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators'; // <-- Importez l'opérateur map

import { Observable } from 'rxjs';
import { environment } from  '../../environments/environment'; // Votre configuration Firebase

import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API = 'http://localhost:3000/auth';
  userLoggedIn = new EventEmitter<void>(); // Nouvel EventEmitter

  constructor(
    private http: HttpClient,

    private afAuth: AngularFireAuth,
    private router: Router
    
  ) {}

  

/* zineb */
async getUserIdByToken(): Promise<string | null> {
  try {
    const token = localStorage.getItem('firebase_token'); // Récupère le token depuis localStorage

    if (!token) {
      console.warn('Aucun token trouvé dans localStorage');
      return null;
    }

    const response = await firstValueFrom(
      this.http.post<{ userId: string }>(
        `http://localhost:3000/auth/get-user-id-by-token`,
        { token }
      )
    );

    //console.log('Réponse du backend:', response);
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
      if (/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(user.uid)) {
        return user.uid;
      }
      console.warn('UID utilisateur n\'est pas un UUID valide:', user.uid);
  
  

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
    console.log('Token Firebase:', token);
    localStorage.setItem('firebase_token', token); // Stocke le token dans localStorage
    console.log('Token stocké dans localStorage:', localStorage.getItem('firebase_token')); // Affiche ce qui est stocké
    return token;
  } catch (error) {
    console.error('Erreur getIdToken:', error);
    return null;
  }
}
/*
  async getIdToken(): Promise<string | null> {
    const user = await this.afAuth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      localStorage.setItem('token', token);
      return token;
    }
    return null;
  }
  */
  


  async loginBackend() {
    const response = await firstValueFrom(
      this.http.post(`${this.API}/login`, { token: await this.getIdToken() })
    );
    this.userLoggedIn.emit(); // Émettre après une connexion réussie
    return response;
  }

  async signupBackend(fname: string, lname: string, password: string) {
    ;

    return firstValueFrom(
      this.http.post(`${this.API}/signup`, {
        token: await this.getIdToken() ,
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
      sessionStorage.removeItem('user');
      //this.router.navigate(['/login']);
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  }
}
/*
import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { getAuth } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  isAuthenticated(): Observable<boolean> {
    return this.afAuth.authState.pipe(
      map(user => !!user)
    );
  }
  private API = 'http://localhost:3000/auth';
  userLoggedIn = new EventEmitter<void>(); // Nouvel EventEmitter

  constructor(
    private http: HttpClient,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {}

  async getIdToken(): Promise<string | null> {
    const user = getAuth().currentUser;
    return user ? await user.getIdToken() : null;
  }

  async loginBackend() {
    const response = await firstValueFrom(
      this.http.post(`${this.API}/login`, { token: await this.getIdToken() })
    );
    this.userLoggedIn.emit(); // Émettre après une connexion réussie
    return response;
  }

  async signupBackend(fname: string, lname: string, password: string) {
    ;

    return firstValueFrom(
      this.http.post(`${this.API}/signup`, {
        token: await this.getIdToken() ,
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
      sessionStorage.removeItem('user');
      //this.router.navigate(['/login']);
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  }
  
}
*/

