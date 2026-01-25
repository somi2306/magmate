import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-prestataire-card',
  standalone:false,
  templateUrl: './prestataire-card.component.html',
  styleUrls: ['./prestataire-card.component.css'],
})
export class PrestataireCardComponent {
  @Input() prestataire: any;

  constructor(private router: Router , private authservice :AuthService ,private afAuth: AngularFireAuth,) {}

  async voirDetails(idPrestataire: String) {
    const user = await this.afAuth.currentUser;
  
    if (user) {
      // Optionnel : récupérer le token si nécessaire
      const token = await user.getIdToken();
      //console.log('Token de l\'utilisateur connecté :', token);
      
      // Naviguer vers la page de détails du prestataire
      this.router.navigate(['/prestataires', idPrestataire]);
    } else {
      // Rediriger vers la page de connexion
      this.router.navigate(['/login']);
    }
  }
  
}