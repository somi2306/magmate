
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }

  return null;
}
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['../auth.component.css'],
  standalone: false,
})
export class SignupComponent {
  signupForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  showPassword: boolean = false;
  showPopup = true;

  constructor(
    private fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private router: Router,
    private authService: AuthService
  ) {
    this.signupForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
        fname: ['', Validators.required],
        lname: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );
  }

  signInWithGoogle() {
    this.afAuth
      .signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .then((result) => {
        //console.log('Connecté avec Google :', result.user);
        this.router.navigate(['/login']);
      })
      .catch((error) => {
        this.errorMessage = this.getErrorMessage(error.code);
      });
  }

  async onSubmit() {
    if (this.signupForm.invalid) return;
    const { email, password } = this.signupForm.value;

    try {
      // Crée l’utilisateur Firebase
      const result = await this.afAuth.createUserWithEmailAndPassword(
        email,
        password
      );
      await result.user?.sendEmailVerification();
      this.successMessage = ' Vérifiez votre email pour confirmer le compte';

      // Appel au backend pour créer / mettre à jour le profil
      const token = await result.user?.getIdToken();
      const { fname, lname } = this.signupForm.value;
      await this.authService.signupBackend(fname, lname, password);
      

      // redirection vers login
      setTimeout(() => this.router.navigate(['/login']), 6000);
    } catch (err: any) {
      this.errorMessage = this.getErrorMessage(err.code);
      this.successMessage = '';
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    const passwordField = document.getElementById(
      'password'
    ) as HTMLInputElement;
    if (passwordField) {
      passwordField.type = this.showPassword ? 'text' : 'password';
    }
  }

  getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Cet email est déjà utilisé.';
      case 'auth/invalid-email':
        return 'Email invalide.';
      case 'auth/weak-password':
        return 'Mot de passe trop faible.';
      case 'auth/operation-not-allowed':
        return 'Opération non autorisée.';
      case 'auth/popup-closed-by-user':
        return 'Fenêtre de connexion fermée avant la fin.';
      default:
        return 'Erreur inconnue : ' + code;
    }
  }
  closePopup() {
    this.showPopup = false;
  }
}
