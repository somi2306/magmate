import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../profile/profile.service';
import { UserProfile } from '../../profile/profil.model';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-profile',
  standalone: false,
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.css'
})
export class AdminProfileComponent implements OnInit{
userProfile!: UserProfile;
  error: string | null = null;
  selectedFile: File | null = null;
  isHovering = false;
  previewUrl: string | null = null;
  isUploading = false;
  uploadSuccess = false;

  constructor(private profileService: ProfileService, private authService: AuthService,private router: Router) {}

  async ngOnInit() {
    try {
      this.userProfile = await this.profileService.getProfile();
    } catch (err: any) {
      this.error = err.message || 'Erreur lors du chargement du profil';
    }
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      // Create preview
      const reader = new FileReader();
      reader.onload = async (e: any) => {
        this.previewUrl = e.target.result;
        await this.uploadPhoto();
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

// profile.component.ts
async uploadPhoto() {
  if (!this.selectedFile) {
    console.error('Aucun fichier sélectionné');
    return;
  }
  this.isUploading = true;
  this.uploadSuccess = false;

  const formData = new FormData();
  formData.append('photo', this.selectedFile);

  try {
    const res: any = await this.profileService.updateProfilePhoto(formData);
    console.log('Réponse du backend:', res);
    this.userProfile.photo = res.photo;
    this.previewUrl = null;
    this.uploadSuccess = true;

    // Pas besoin d'émettre manuellement ici, car le service le fait déjà
    
    // Cacher la notif après 3 secondes
    setTimeout(() => this.uploadSuccess = false, 3000);
  } catch (err) {
    console.error('Erreur de mise à jour :', err);
  } finally {
    this.isUploading = false;
  }
}
  onImageLoad(event: Event) {
    (event.target as HTMLElement)
      .closest('.profile-photo')
      ?.classList.add('loaded');
  }
  navigateToMessagerie() {
    this.router.navigate(['/admin/messagerie']);
  }

  logout() {
    this.authService.logout();
  }
}
