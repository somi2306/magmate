import { Component, OnInit } from '@angular/core';
import { PrestataireService, Prestataire } from '../../services/prestataire.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
//import { AlertService } from '../../marketplace/services/alerte.service';

@Component({
  selector: 'app-prestataire',
  standalone: false,
  templateUrl: './prestataire.component.html',
  styleUrls: ['./prestataire.component.scss']
})
export class PrestataireComponent implements OnInit {
  prestataire?: Prestataire;
  editing = false;
  form!: FormGroup;
  alertMessage: string | null = null;
  alertType: 'success' | 'error' = 'success';

  closeAlert() {
    this.alertMessage = null;
  }

  constructor(
    private prestataireService: PrestataireService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.load();
    this.initForm();
  }
  initForm(data?: Prestataire): void {
    this.form = this.fb.group({
      specialite: [data?.specialite || '', Validators.required],
      experience: [data?.experience || '', Validators.required],
      localisation: [data?.localisation || '', Validators.required],
      telephone: [data?.telephone || '', Validators.required],
      ville: [data?.ville || '', Validators.required],
    });
  
    if (!data) this.editing = true; // Forcer affichage du formulaire si aucun prestataire
  }

  load(): void {
    this.prestataireService.getMe().subscribe({
      next: (data) => {
        //console.log(data);
      //  this.prestataire = data;
       // this.initForm(data);
      },
      error: (err) => {
        console.error('Erreur de chargement :', err);
      }
    });
  }

  

  /*onSubmit(): void {
    if (!this.form.valid) return;

    const dto = this.form.value;

    //  Partie mise à jour commentée temporairement
    /*
    const request$ = this.prestataire
      ? this.prestataireService.update(dto)
      : this.prestataireService.create(dto);

    request$.subscribe({
      next: () => {
        this.alertType = 'success';
        this.alertMessage = this.prestataire
          ? 'Prestataire mis à jour avec succès.'
          : 'Prestataire créé avec succès.';
        this.editing = false;
        this.load();
      },
      error: (err) => {
        this.alertType = 'error';
        this.alertMessage = 'Une erreur est survenue. Veuillez réessayer.';
        console.error(err);
      }
    });
    

    //  Création uniquement pour test
    this.prestataireService.create(dto).subscribe({
      next: () => {
        this.alertType = 'success';
        this.alertMessage = 'Prestataire créé avec succès.';
        this.editing = false;
        this.load();
      },
      error: (err) => {
        this.alertType = 'error';
        this.alertMessage = 'Une erreur est survenue lors de la création.';
        console.error(err);
      }
    });
  }*/
    onSubmit(): void {
      if (!this.form.valid) return;
    
      const dto = this.form.value;
    
      // 1. Récupérer le user connecté
      const userString = localStorage.getItem('user') || sessionStorage.getItem('user');
    
      if (!userString) {
        this.alertType = 'error';
        this.alertMessage = 'Utilisateur non connecté.';
        return;
      }
    
      const user = JSON.parse(userString);
      const email = user.email;
    
      // 2. Récupérer le UUID par email
      this.prestataireService.getUuidByEmail(email).subscribe({
        next: (response) => {
          const uuid = response.uuid;
    
          // 3. Créer le prestataire avec UUID
          this.prestataireService.createWithUuid(dto, uuid).subscribe({
            next: () => {
              this.alertType = 'success';
              this.alertMessage = 'Prestataire créé avec succès.';
              this.editing = false;
              this.load();
              
            },
            error: (err) => {
              this.alertType = 'error';
              this.alertMessage = 'Erreur lors de la création.';
              console.error(err);
            }
          });
        },
        error: (err) => {
          this.alertType = 'error';
          this.alertMessage = 'Erreur lors de la récupération de l\'UUID.';
          console.error(err);
        }
      });
    }
    

  delete(): void {
    this.prestataireService.delete().subscribe(() => {
      this.prestataire = undefined;
    });
  }
}
