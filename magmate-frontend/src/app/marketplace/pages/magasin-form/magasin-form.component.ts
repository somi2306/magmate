import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MagasinService } from '../../services/magasin.service';
import { AlertService } from '../../services/alerte.service'; 
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-magasin-form',
  standalone: false,
  templateUrl: './magasin-form.component.html',
  styleUrls: ['./magasin-form.component.scss']
})
export class MagasinFormComponent implements OnInit {
  magasinForm: FormGroup;
  alertMessage: string | null = null;
  alertType: 'success' | 'error' | null = null;
  imageFile: File | null = null;
  userId: string = '';  // Pour stocker l'ID de l'utilisateur connecté

  constructor(
    private fb: FormBuilder,
    private magasinService: MagasinService,
    private alertService: AlertService, // Injection du service
    private router: Router,
    private authService: AuthService  // Injection du service AuthService
  ) {
    this.magasinForm = this.fb.group({
      nom: ['', Validators.required],
      localisation: ['', Validators.required],
      description: ['', Validators.required],
      horaire: ['', Validators.required],
      telephone: ['', Validators.required],
      ville: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Récupérer l'ID de l'utilisateur connecté
    this.authService.getIdToken().then((token) => {
      if (!token) {
        // Si aucun token n'est trouvé, rediriger vers la page de connexion
        this.router.navigate(['/login']);
        return;
      }

      // En cas de succès, stocker l'ID de l'utilisateur
      this.userId = token;
    }).catch((error) => {
      console.error('Erreur de récupération du token :', error);
    });

    // Subscribe to alert service
    this.alertService.alert$.subscribe(alert => {
      this.alertMessage = alert.message;
      this.alertType = alert.type;
    });
  }

  // Gérer la sélection d'image
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;  //  Stocke dans une propriété à part
    }
  }

  // Gérer la soumission du formulaire
  onSubmit(): void {
    if (this.magasinForm.invalid) return;
  
    // 1. Récupérer les données du formulaire
    const userString = localStorage.getItem('user') || sessionStorage.getItem('user');
  
    if (!userString) {
      this.alertService.error('Utilisateur non connecté.');
      return;
    }
  
    const user = JSON.parse(userString);
    const email = user.email;
  
    // 2. Récupérer l'ID du propriétaire (UUID ou autre) via le service
    this.magasinService.getUuidByEmail(email).subscribe({
      next: (response) => {
        const proprietaireId = response.uuid; // ou response.id selon ton backend
  
        const magasinData = new FormData();
        magasinData.append('nom', this.magasinForm.get('nom')?.value);
        magasinData.append('localisation', this.magasinForm.get('localisation')?.value);
        magasinData.append('description', this.magasinForm.get('description')?.value);
        magasinData.append('horaire', this.magasinForm.get('horaire')?.value);
        magasinData.append('telephone', this.magasinForm.get('telephone')?.value);
        magasinData.append('ville', this.magasinForm.get('ville')?.value);
  
        // 3. Ajouter l'image
        if (this.imageFile) {
          magasinData.append('image', this.imageFile, this.imageFile.name);
        } else {
          this.alertService.error("Veuillez sélectionner une image.");
          return;
        }
  
        magasinData.append('proprietaireId', proprietaireId);
  
        // 4. Envoyer les données
        this.magasinService.createMagasin(magasinData).subscribe({
          next: (response) => {
            this.alertService.success('Votre magasin a été créé avec succès.');
            this.router.navigate(['/marketplace']);
          },
          error: (error) => {
            console.error('Erreur lors de la création du magasin', error);
            this.alertService.error('Erreur lors de la création du magasin.');
          }
        });
      },
      error: (err) => {
        this.alertService.error("Impossible de récupérer l'identifiant de l'utilisateur.");
        console.error(err);
      }
    });
  }
  

  // Méthode pour fermer l'alerte
  closeAlert() {
    this.alertMessage = null;
    this.alertType = null;
  }
}