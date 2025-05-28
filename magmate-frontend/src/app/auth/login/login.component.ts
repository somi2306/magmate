// login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['../auth.component.css'],
  standalone: false,
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  errorMessage = '';
  showPassword = false;
  showPopup = true;

  constructor(
    private fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      remember: [false],
    });
  }

  ngOnInit(): void {
    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (user) {
      this.router.navigate(['/']);
    }
  }

  async onLogin() {
    if (this.loginForm.invalid) return;
    const { email, password, remember } = this.loginForm.value;

    try {
      // 1) Firebase sign-in
      const persistence = remember
        ? firebase.auth.Auth.Persistence.LOCAL
        : firebase.auth.Auth.Persistence.SESSION;
      await this.afAuth['setPersistence(persistence)']; //.setPersistence(persistence)
      const result = await this.afAuth['signInWithEmailAndPassword'](
        email,
        password
      );

      // 2) Vérification d'email
      if (!result.user?.emailVerified) {
        await this.afAuth['signOut()'];
        this.errorMessage = 'Vérifiez d’abord votre email.';
        return;
      }
      if (!result.user) {
        this.errorMessage = 'Connexion échouée.';
        return;
      }

      // 3) Appel au backend avec le token Firebase
      const backendUser = await this.authService.loginBackend();
      console.log('👌 Backend a répondu :', backendUser);

      // 4) Stocker l'utilisateur dans localStorage/sessionStorage
      if (remember) {
        localStorage.setItem('user', JSON.stringify(result.user));
      } else {
        sessionStorage.setItem('user', JSON.stringify(result.user));
      }

      // 5) Maintenant on navigue
      this.router.navigate(['/']);
    } catch (err: any) {
      this.errorMessage = this.getErrorMessage(err.code);
    }
  }
  getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
        return 'Aucun utilisateur trouvé avec cet email.';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect.';
      case 'auth/invalid-email':
        return 'Email invalide.';
      case 'auth/popup-closed-by-user':
        return 'Connexion annulée.';
      case 'auth/network-request-failed':
        return 'Problème de connexion Internet.';
      default:
        return "Une erreur s'est produite.";
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    const passwordField = document.getElementById(
      'loginPassword'
    ) as HTMLInputElement;
    if (passwordField) {
      passwordField.type = this.showPassword ? 'text' : 'password';
    }
  }

  async signInWithGoogle() {
    try {
      const result = await this.afAuth['signInWithPopup'](
        new firebase.auth.GoogleAuthProvider()
      );

      if (!result.user?.emailVerified) {
        this.errorMessage = "Votre email Google n'est pas vérifié.";
        return;
      }

      await this.authService.loginBackend(); // ou une méthode dédiée
      this.router.navigate(['/']);

      //this.router.navigate(['/profile']);
    } catch (err: any) {
      this.errorMessage = this.getErrorMessage(err.code);
    }
  }

  async resetPassword() {
    const email = this.loginForm.value.email;
    if (!email) {
      this.errorMessage = 'Veuillez entrer votre adresse email.';
      return;
    }

    try {
      await this.afAuth['sendPasswordResetEmail(email)'];
      this.errorMessage = 'Un email de réinitialisation vous a été envoyé.';
    } catch (error: any) {
      this.errorMessage = this.getErrorMessage(error.code);
    }
  }

  closePopup() {
    this.showPopup = false;
  }
}