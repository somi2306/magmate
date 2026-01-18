import { Component, OnInit } from '@angular/core';
import { PrestataireService } from '../../services/prestataire.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { getAuth } from 'firebase/auth';
@Component({
  selector: 'app-accueil-prestataire',
  standalone: false,
  templateUrl: './accueil-prestataire.component.html',
  styleUrls: ['./accueil-prestataire.component.css'],
})
export class AccueilPrestataireComponent implements OnInit {
  prestataires: any[] = [];
  selectedVille: string = '';
  selectedSpecialite: string = '';
  query: string = '';
  villes: string[] = [
    'Agadir',
    'Al Hoceima',
    'Asilah',
    'Azilal',
    'Azemmour',
    'Beni Mellal',
    'Berkane',
    'Berrechid',
    'Casablanca',
    'Chefchaouen',
    'Dakhla',
    'El Jadida',
    'Errachidia',
    'Essaouira',
    'Fès',
    'Figuig',
    'Guelmim',
    'Ifrane',
    'Kénitra',
    'Khemisset',
    'Khénifra',
    'Khouribga',
    'Laâyoune',
    'Larache',
    'Marrakech',
    'Martil',
    'Meknès',
    'Mohammedia',
    'Nador',
    'Ouarzazate',
    'Oujda',
    'Rabat',
    'Safi',
    'Salé',
    'Sefrou',
    'Settat',
    'Sidi Bennour',
    'Sidi Ifni',
    'Sidi Kacem',
    'Skhirat',
    'Tanger',
    'Tan-Tan',
    'Taounate',
    'Taroudant',
    'Taza',
    'Temara',
    'Tétouan',
    'Tinghir',
    'Tiznit',
  ];

  showPopup: boolean = false;
  message: string = '';
  showPrestatairePopup: boolean = false;
  private adminId: string = '6f3e7ea2-d6fd-44a9-b82a-4a9c7c20d9d4';

  constructor(
    private prestataireService: PrestataireService,
    private router: Router,
    private authservice: AuthService
  ) {}

  ngOnInit() {
    this.loadPrestataires();
    // Supprimez tout appel à openModal() ou à des logiques similaires ici.
    // Les pop-ups ne doivent être activés que par le clic sur "Mon profil".
  }
  

  loadPrestataires() {
    this.prestataireService
      .getPrestataires(this.query, this.selectedVille)
      .subscribe({
        next: (data) => {
          this.prestataires = data;
          console.log('Prestataires chargés:', data);
        },
        error: (err) => {
          console.error('Erreur:', err);
          this.prestataires = [];
        },
      });
  }

  scrollToPrestataires() {
    const prestataireSection = document.querySelector('.search-bar');
    if (prestataireSection) {
      prestataireSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
  // Ces fonctions sont maintenant redondantes, car les pop-ups sont gérés par *ngIf.
  // Vous pouvez les laisser ou les supprimer si elles ne sont plus utilisées nulle part ailleurs.
  openModal() {
    // La logique est maintenant gérée par showPrestatairePopup et *ngIf.
  }

  closeModal() {
    // La logique est maintenant gérée par showPrestatairePopup et *ngIf.
  }


  monprofil() {
    const userString = localStorage.getItem('user') || sessionStorage.getItem('user');
  
    if (userString) {
      const user = JSON.parse(userString);
      const email = user.email;
  
      this.prestataireService.getUuidByEmail(email).subscribe({
        next: (response) => {
          const uuid = response.uuid;
          console.log('UUID depuis la BDD :', uuid);
  
          localStorage.setItem('uuid', uuid);
  
          this.prestataireService.getByUuid(uuid).subscribe({
            next: (prestataire) => {
              if (prestataire) {
                if (prestataire.estApprouve === 'approved') {
                  this.router.navigate(['/monprofil']);
                } else if (prestataire.estApprouve === 'pending') {
                  this.message = 'Votre profil est en attente d\'approbation.';
                  this.showPopup = true;
                  this.showPrestatairePopup = false; // Assurez-vous que l'autre popup est fermé.
                } else if (prestataire.estApprouve === 'rejected') {
                  this.message = 'Votre profil prestataire a été rejeté. Veuillez contacter l\'administrateur pour plus d\'informations.';
                  this.showPopup = true;
                  this.showPrestatairePopup = false; // Assurez-vous que l'autre popup est fermé.
                }
              } else {
                this.showPrestatairePopup = true; // Afficher le popup "créer profil" si aucun prestataire n'est trouvé.
                this.showPopup = false; // Assurez-vous que l'autre popup est fermé.
              }
            },
            error: (err) => {
              console.error("Erreur lors de la récupération du prestataire :", err);
              this.showPrestatairePopup = true; // En cas d'erreur lors de la récupération, suggérer de créer le profil.
              this.showPopup = false; // Assurez-vous que l'autre popup est fermé.
            }
          });
        },
        error: (err) => {
          console.error('Erreur lors de la récupération de l\'UUID :', err);
          this.router.navigate(['/login']);
        }
      });
  
    } else {
      this.router.navigate(['/login']);
    }
  }

  closePopup() {
    this.showPopup = false;
  }

  closePrestatairePopup() {
    this.showPrestatairePopup = false;
  }

  contactAdmin(): void {
    this.router.navigate(['/messagerie'], {
      queryParams: { recipientId: this.adminId }
    });
    this.closePopup();
  }

  get prestatairesApprouves() {
    return this.prestataires.filter(p => p.estApprouve === 'approved');
  }
}