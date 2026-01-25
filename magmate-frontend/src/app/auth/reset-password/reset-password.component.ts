
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['../auth.component.css'],
  standalone: false,
})
export class ResetPasswordComponent {
  resetForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  showPopup = true;

  constructor(
    private fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  async onResetPassword() {
    if (this.resetForm.invalid) return;
    const { email } = this.resetForm.value;

    try {
      await this.afAuth.sendPasswordResetEmail(email);
      this.successMessage = 'Un email de réinitialisation a été envoyé.';
      this.errorMessage = '';
    } catch (error: any) {
      this.errorMessage = this.getErrorMessage(error.code);
      this.successMessage = '';
    }
  }

  getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
        return 'Aucun utilisateur trouvé avec cet email.';
      case 'auth/invalid-email':
        return 'Adresse email invalide.';
      case 'auth/missing-email':
        return 'Veuillez entrer votre adresse email.';
      case 'auth/network-request-failed':
        return 'Problème de connexion Internet.';
      default:
        return "Une erreur s'est produite.";
    }
  }

  closePopup() {
    this.showPopup = false;
  }
}
