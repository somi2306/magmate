import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MagasinService } from '../../services/magasin.service';
import { AlertService } from '../../services/alerte.service';
import { AuthService } from '../../../auth/auth.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-magasin-update',
  standalone: false,
  templateUrl: './magasin-update.component.html',
  styleUrls: ['./magasin-update.component.scss']
})
export class MagasinUpdateComponent implements OnInit {
  magasinForm: FormGroup;
  imagePreview: string | null = null;
  selectedFile: File | null = null; // Un seul endroit pour stocker le fichier
  alertMessage: string | null = null;
  alertType: 'success' | 'error' | null = null;

  magasinId!: number;
  userId: string = '';

  constructor(
    private fb: FormBuilder,
    private magasinService: MagasinService,
    private router: Router,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private authService: AuthService
  ) {
    this.magasinForm = this.fb.group({
      nom: ['', Validators.required],
      description: ['', Validators.required],
      localisation: ['', Validators.required],
      horaire: ['', Validators.required],
      telephone: ['', Validators.required],
      ville: ['', Validators.required],
      image: ['']
    });
  }

  ngOnInit(): void {
    // Récupérer l'ID de l'utilisateur (optionnel selon votre logique auth)
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = user.id || '';
    
    this.loadMagasin();
  }

  loadMagasin(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.magasinId = +params.get('id')!;
        return this.magasinService.getMagasinById(this.magasinId);
      })
    ).subscribe(magasin => {
      this.magasinForm.patchValue({
        nom: magasin.nom,
        description: magasin.description,
        localisation: magasin.localisation,
        horaire: magasin.horaire,
        telephone: magasin.telephone,
        ville: magasin.ville
      });

      if (magasin.image) {
        this.imagePreview = magasin.image;
      }
    });
  }

  // Méthode unique pour gérer le changement de fichier
  onFileChange(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      // Création d'une URL temporaire pour la prévisualisation locale
      this.imagePreview = URL.createObjectURL(file);
    }
  }

  onSubmit(): void {
    if (this.magasinForm.invalid) {
      return;
    }

    const magasinData = new FormData();
    const formValues = this.magasinForm.value;

    // On ajoute tous les champs texte au FormData
    Object.keys(formValues).forEach(key => {
      if (key !== 'image' && formValues[key]) {
        magasinData.append(key, formValues[key]);
      }
    });

    // Si l'utilisateur a sélectionné une nouvelle image, on l'ajoute
    if (this.selectedFile) {
      magasinData.append('image', this.selectedFile);
    }

    // On s'assure d'envoyer l'ID du propriétaire
    magasinData.append('proprietaireId', this.userId);

    this.magasinService.updateMagasin(this.magasinId, magasinData).subscribe({
      next: () => {
        this.alertService.success('Le magasin a été mis à jour avec succès !');
        this.router.navigate(['/marketplace']);
      },
      error: (err) => {
        console.error('Erreur update:', err);
        this.alertService.error('Une erreur est survenue lors de la mise à jour.');
      }
    });
  }

  closeAlert() {
    this.alertMessage = null;
    this.alertType = null;
  }
}