import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service'; // Ajuste le chemin si besoin
import { environment } from '../../environments/environment'; // Pour baseUrl
import { Router } from '@angular/router'; // Pour redirection
import { User } from '../models/user.model'; 
@Component({
  selector: 'app-admin-auth',
  standalone: false,
  templateUrl: './admin-auth.component.html',
  styleUrl: './admin-auth.component.css'
})



export class AdminAuthComponent implements OnInit {
  qrCodeUrl: string | null = null;
  totpCode: string = '';
  message: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.get2FASecret();
  }

  get2FASecret() {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!user) {
      this.router.navigate(['/login']); // Redirigez vers la page de connexion si l'utilisateur n'est pas authentifié
      return;
    }

    const userObj :User = JSON.parse(user!); // Assure-toi que c'est bien un JSON stringifié

    this.http
      .post<{ otpauthUrl: string }>(`${environment.apiUrl}/auth/2fa/generate`, {
        email: userObj.email,
      })
      .subscribe({
        next: (res) => {
          this.qrCodeUrl = res.otpauthUrl;
        },
        error: () => {
          this.message = 'Erreur lors de la génération du QR Code.';
        },
      });
  }

  enable2FA() {
    console.log('Attempting to enable 2FA with code:', this.totpCode); // <-- Ajoutez ceci
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!user) {
      this.router.navigate(['/login']); // Redirigez vers la page de connexion si l'utilisateur n'est pas authentifié
      return;
    }
    const userObj:User = JSON.parse(user); // Assure-toi que c'est bien un JSON stringifié
    this.http
      .post(`${environment.apiUrl}/auth/2fa/enable`, {
        email: userObj.email,
        code: this.totpCode,
      })
      .subscribe({
        next: () => {
          this.message = '2FA activé avec succès !';
          this.router.navigate(['/admin/home']); 
        },
        error: () => {
          this.message = 'Code invalide.';
        },
      });
  }
}

