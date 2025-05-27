import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { EventsService } from '../events.service';
import { EventType } from '../event.model';

@Component({
  selector: 'app-event-create',
  templateUrl: './events-create.component.html',
  styleUrls: ['./events-create.component.css'],
  standalone: false,
})
export class EventsCreateComponent implements OnInit {
  eventForm: FormGroup;
  eventTypes = Object.values(EventType);
  isSubmitting = false;
  formError = '';
  isEditMode = false; // Détecte si on est en mode modification
  eventId: string | null = null;
  selectedFile: File | null = null;
  imageError: string = '';

  // Liste prédéfinie de villes françaises (à adapter selon vos besoins)
  cities = [
    'Agadir',
    'Aït Melloul',
    'Al Hoceïma',
    'Azrou',
    'Beni Mellal',
    'Berkane',
    'Boujdour',
    'Casablanca',
    'Chefchaouen',
    'Chichaoua',
    'Dakhla',
    'Dcheira El Jihadia',
    'El Jadida',
    'Errachidia',
    'Essaouira',
    'Fès',
    'Guercif',
    'Ifrane',
    'Inezgane',
    'Kénitra',
    'Khémisset',
    'Khouribga',
    'Laâyoune',
    'Larache',
    'Marrakech',
    'Meknès',
    'Mohammédia',
    'Nador',
    'Oujda',
    'Rabat',
    'Salé',
    'Safi',
    'Sefrou',
    'Settat',
    'Sidi Kacem',
    'Sidi Slimane',
    'Taourirt',
    'Taza',
    'Témara',
    'Tétouan',
    'Taroudant',
    'Taounate',
    'Tiznit',
    'Youssoufia',
  ];

  constructor(
    private fb: FormBuilder,
    private eventsService: EventsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.eventForm = this.createForm();
  }

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('id');
    if (this.eventId) {
      this.isEditMode = true;
      this.loadEventDetails(this.eventId);
    }
  }
  // Charger les détails de l'événement en mode modification
  loadEventDetails(id: string): void {
    this.eventsService.getEventById(id).subscribe({
      next: (event) => {
        console.log('Valeur ville reçue:', event.city);

        this.eventForm.patchValue({
          ...event,
          date: this.toDatetimeLocal(event.date),
        });
      },
      error: (error) => {
        console.error(
          "Erreur lors du chargement des détails de l'événement :",
          error
        );
        this.router.navigate(['/events']); // Redirige si l'événement n'existe pas
      },
    });
  }
  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      city: ['', Validators.required],
      lieu: ['', Validators.required],
      type: [EventType.EVENT, Validators.required],
      date: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.eventForm.invalid) {
      this.markFormGroupTouched(this.eventForm);
      if (!this.selectedFile) this.imageError = "L'image est obligatoire";
      return;
    }

    this.isSubmitting = true;
    this.formError = '';

    const formData = new FormData();
    formData.append('title', this.eventForm.value.title);
    formData.append('description', this.eventForm.value.description);
    formData.append('city', this.eventForm.value.city);
    formData.append('lieu', this.eventForm.value.lieu);
    formData.append('type', this.eventForm.value.type);
    formData.append('date', this.eventForm.value.date);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    if (this.isEditMode && this.eventId) {
      // Mode modification
      this.eventsService.updateEvent(this.eventId, formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          alert('Événement modifié avec succès !');
          this.router.navigate(['/events/my']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.formError =
            error.error?.message ||
            "Une erreur est survenue lors de la modification de l'événement";
          console.error("Erreur de modification d'événement", error);
        },
      });
    } else {
      // Mode création
      this.eventsService.createEvent(formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          alert('Événement créé avec succès !');
          this.router.navigate(['/events']);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.formError =
            error.error?.message ||
            "Une erreur est survenue lors de la création de l'événement";
          console.error("Erreur de création d'événement", error);
        },
      });
    }
  }
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }
  hasError(controlName: string, errorName?: string): boolean {
    const control = this.eventForm.get(controlName);
    if (!control) return false;

    if (errorName) {
      return control.hasError(errorName) && (control.dirty || control.touched);
    }

    return control.invalid && (control.dirty || control.touched);
  }
  cancel(): void {
    if (this.isEditMode) {
      // Redirige vers la page "Mes événements" en mode modification
      this.router.navigate(['/events/my']);
    } else {
      // Redirige vers la liste des événements en mode création
      this.router.navigate(['/events']);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
        this.imageError = 'Seuls les fichiers JPG, JPEG et PNG sont autorisés';
        this.selectedFile = null;
      } else if (file.size > 2 * 1024 * 1024) {
        this.imageError = "La taille de l'image ne doit pas dépasser 2 Mo";
        this.selectedFile = null;
      } else {
        this.selectedFile = file;
        this.imageError = '';
      }
    }
  }

  private toDatetimeLocal(dateInput: string | Date): string {
    if (!dateInput) return '';
    const date =
      typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    // Décale selon le fuseau pour affichage correct
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISO = new Date(date.getTime() - tzOffset)
      .toISOString()
      .slice(0, 16);
    return localISO;
  }
}
