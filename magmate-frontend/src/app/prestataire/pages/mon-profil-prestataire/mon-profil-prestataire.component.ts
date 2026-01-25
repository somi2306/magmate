import { Component } from '@angular/core';
import { PrestataireService } from '../../services/prestataire.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mon-profil-prestataire',
  standalone: false,
  templateUrl: './mon-profil-prestataire.component.html',
  styleUrl: './mon-profil-prestataire.component.css'
})
export class MonProfilPrestataireComponent {
  
  prestataire: any;
  uuid: string | null = null;

  constructor(
    private prestataireService: PrestataireService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.uuid = localStorage.getItem('uuid');
    //console.log('UUID trouvé dans localStorage :', this.uuid);
    if (this.uuid) {
      this.prestataireService.getMe2(this.uuid).subscribe({
        next: (data) => {
          this.prestataire = data;
          //console.log('Profil prestataire:', this.prestataire);  // Vérifie les données
        },
        error: (err) => {
          console.error('Erreur lors du chargement du profil prestataire :', err);
          alert('Une erreur est survenue lors du chargement du profil.');  // Ajoute une alerte pour l'utilisateur
        }
      });
    } else {
      this.router.navigate(['/login']);
    }
  }
  
 
  toggleDisponibilite() {
    if (!this.prestataire) return;
  
    const newDispo = !this.prestataire.disponibilite;
  
    this.prestataireService.updateDisponibilite(this.prestataire.idPrestataire, newDispo)
      .subscribe({
        next: () => this.prestataire!.disponibilite = newDispo,
        error: err => console.error('Erreur lors de la mise à jour de la disponibilité', err)
      });
  }
  delete(): void {
    this.prestataireService.delete().subscribe(() => {
      this.prestataire = undefined;
    });
  }
  deleteProfil() {
    if (this.prestataire && this.prestataire.idPrestataire) {
      const prestataireId = this.prestataire.idPrestataire;
      this.prestataireService.deletePrestataire(prestataireId).subscribe({
        next: () => {
          alert('Profil supprimé avec succès');
          this.router.navigate(['/']); // Redirige vers la page d'accueil ou une autre page
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du profil', err);
          alert('Une erreur est survenue lors de la suppression du profil');
        }
      });
    }
  }
  
  

}



