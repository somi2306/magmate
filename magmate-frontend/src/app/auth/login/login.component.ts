// login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  showTwoFactorForm = false;
  twoFactorCode = '';
  phoneNumber = '';
  backendRole = '';
  recaptchaVerifier!: firebase.auth.RecaptchaVerifier;
  confirmationResult: firebase.auth.ConfirmationResult | null = null;
  private authSubscription: Subscription | null = null;

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
    console.log(
      'User in localStorage/sessionStorage:',
      localStorage.getItem('user') || sessionStorage.getItem('user')
    );

    const user = localStorage.getItem('user') || sessionStorage.getItem('user');
    console.log('Retrieved user from storage:', user); // Vérifier si on récupère bien quelque chose
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        console.log('Parsed user:', parsedUser); // Vérifiez si le JSON est bien parsé
        if (parsedUser && parsedUser.emailVerified) {
          console.log('User role:', parsedUser.role); // Vérifiez le rôle de l'utilisateur
          this.redirectUser(parsedUser.role);
        }
      } catch (error) {
        console.error('Error parsing user:', error); // Gestion des erreurs de parsing
      }
    }
    console.log('Initializing Firebase and reCAPTCHA...');
    if (!firebase.apps.length) {
      console.error('Firebase app is not initialized.');
      firebase.initializeApp(environment.firebase); // Initialisez Firebase si nécessaire
    }
  }

  setupReCaptcha(): void {
    if (!firebase.apps.length) {
      console.error('Firebase app is not initialized.');
      return;
    }

    console.log('Setting up reCAPTCHA...');
    this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      'recaptcha-container',
      {
        size: 'invisible',
        callback: (response: any) => {
          console.log('reCAPTCHA resolved:', response);
        },
        'expired-callback': () => {
          console.error('reCAPTCHA expired');
        },
      }
    );

    this.recaptchaVerifier.render().then((widgetId) => {
      console.log('reCAPTCHA widgetId:', widgetId);
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }

    // Clear reCAPTCHA if it exists
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
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
      await this.afAuth.setPersistence(persistence);
      const result = await this.afAuth.signInWithEmailAndPassword(
        email,
        password
      );

      // 2) Vérification d'email
      if (!result.user?.emailVerified) {
        await this.afAuth.signOut();
        this.errorMessage = 'Vérifiez d’abord votre email.';
        return;
      }
      if (!result.user) {
        this.errorMessage = 'Connexion échouée.';
        return;
      }

      // 3) Appel au backend avec le token Firebase
      const backendUser = await this.authService.loginBackend();
      if (!backendUser) {
        this.errorMessage = 'Utilisateur introuvable côté backend.';
        return;
      }

      /*// 4) Vérifie s'il a le 2FA activé et c'est un admin
      if (backendUser.role === 'admin' && backendUser.twoFactorRequired) {
        this.showTwoFactorForm = true;
        this.phoneNumber = backendUser.phoneNumber; // si tu veux l’afficher ou l’utiliser
        this.backendRole = backendUser.role;
        console.log('Calling sendSmsCode with phone number:', this.phoneNumber);
        this.sendSmsCode(this.phoneNumber);

        return;
      }*/

      // 5) Stocker l'utilisateur dans localStorage/sessionStorage
      if (remember) {
        localStorage.setItem('user', JSON.stringify(result.user));
      } else {
        sessionStorage.setItem('user', JSON.stringify(result.user));
      }
      this.redirectUser(backendUser.role);
    } catch (err: any) {
      this.errorMessage = this.getErrorMessage(err.code);
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
      const result = await this.afAuth.signInWithPopup(
        new firebase.auth.GoogleAuthProvider()
      );

      if (!result.user?.emailVerified) {
        this.errorMessage = "Votre email Google n'est pas vérifié.";
        return;
      }

      await this.authService.loginBackend(); // ou une méthode dédiée
      this.redirectUser(this.backendRole);
    } catch (err: any) {
      this.errorMessage = this.getErrorMessage(err.code);
    }
  }

  async sendSmsCode(phoneNumber: string) {
  console.log('Sending SMS to:', phoneNumber);

  // Vérifiez si reCAPTCHA est déjà initialisé
  if (!this.recaptchaVerifier) {
    console.log('Initializing reCAPTCHA verifier...');
    this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
      'recaptcha-container',
      {
        size: 'invisible',
        callback: (response: any) => {
          console.log('reCAPTCHA resolved:', response);
        },
        'expired-callback': () => {
          console.error('reCAPTCHA expired');
        },
      }
    );

    try {
      await this.recaptchaVerifier.render();
      console.log('reCAPTCHA verifier initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize reCAPTCHA verifier:', error);
      this.errorMessage = 'Erreur lors de l\'initialisation de reCAPTCHA.';
      return;
    }
  }

  try {
    const result = await firebase
      .auth()
      .signInWithPhoneNumber(phoneNumber, this.recaptchaVerifier);
    console.log('SMS sent successfully');

    // Stocker le confirmationResult dans la classe
    this.confirmationResult = result;
    console.log('Confirmation result stored:', this.confirmationResult);
  } catch (error: any) {
    this.errorMessage = "Erreur lors de l'envoi du SMS : " + error.message;
    console.error('SMS Error:', error);
  }
}

  async verifyTwoFactorCode() {
    if (!this.twoFactorCode) {
      this.errorMessage = 'Veuillez entrer le code reçu par SMS.';
      return;
    }
    console.log('Code entered by user:', this.twoFactorCode);
    console.log('Verifying code...');

    if (!this.confirmationResult) {
      console.error('No confirmationResult found.');
      this.errorMessage = "Une erreur s'est produite lors de la vérification.";
      return;
    }

    try {
      console.log('Confirmation result retrieved:', this.confirmationResult);
      const result = await this.confirmationResult.confirm(this.twoFactorCode);
      console.log('Verification successful:', result);

      // Authentification réussie
      if (this.loginForm.value.remember) {
        localStorage.setItem('user', JSON.stringify(result.user));
      } else {
        sessionStorage.setItem('user', JSON.stringify(result.user));
      }

      this.redirectUser(this.backendRole);
    } catch (error: any) {
      console.error('Verification failed:', error);
      this.errorMessage = 'Code invalide ou expiré.';
    }
  }

  async resetPassword() {
    const email = this.loginForm.value.email;
    if (!email) {
      this.errorMessage = 'Veuillez entrer votre adresse email.';
      return;
    }

    try {
      await this.afAuth.sendPasswordResetEmail(email);
      this.errorMessage = 'Un email de réinitialisation vous a été envoyé.';
    } catch (error: any) {
      this.errorMessage = this.getErrorMessage(error.code);
    }
  }

  closePopup() {
    this.showPopup = false;
  }

  redirectUser(role: string) {
    console.log('Redirecting user with role:', role); // Log du rôle pour vérifier la redirection
    switch (role) {
      case 'admin':
        this.router.navigate(['/admin-auth']);
        break;
      case 'client':
      default:
        this.router.navigate(['/']);
        break;
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
}
