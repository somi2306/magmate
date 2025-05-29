// header.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProfileService } from '../../profile/profile.service';
import { AuthService } from '../../auth/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Subscription } from 'rxjs';
import { MessagerieService  } from '../messagerie/services/messagerie.service'; // Ajustez le chemin
@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  profilePhotoUrl: string | null = null;
  private profileUpdateSubscription: Subscription | null = null;
  private authSubscription: Subscription | null = null;
  private authStateSubscription: Subscription | null = null;
  showDropdown = false;
  totalUnreadMessages = 0;
  private messagerieSubscription?: Subscription;
  isPulsing = false;
  showTranslationDropdown = false;

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private afAuth: AngularFireAuth,
    private messagerieService: MessagerieService
  ) {}

    toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  hideDropdown(): void {
    this.showDropdown = false;
  }

  toggleTranslationDropdown(event: Event): void {
  event.preventDefault(); // Prevents page jump
  this.showTranslationDropdown = !this.showTranslationDropdown;
}

hideTranslationDropdown(): void {
  this.showTranslationDropdown = false;
}

async ngOnInit(): Promise<void> {
  this.authStateSubscription = this.afAuth.authState.subscribe(async user => {
    if (user) {
      await this.loadProfile();
      await this.initMessagerieNotifications(); // <-- Initialisation seulement si user connecté
    } else {
      this.profilePhotoUrl = 'images/default-profile.png';
      this.totalUnreadMessages = 0; // <-- Reset des notifications si déconnecté
    }
  });

  this.profileUpdateSubscription = this.profileService.profileUpdated.subscribe(async () => {
    if (await this.afAuth.currentUser) {
      await this.loadProfile();
    }
  });

  this.authSubscription = this.authService.userLoggedIn.subscribe(async () => {
    if (await this.afAuth.currentUser) {
      await this.loadProfile();
    }
  });
}

  ngOnDestroy(): void {
    this.profileUpdateSubscription?.unsubscribe();
    this.authSubscription?.unsubscribe();
    this.authStateSubscription?.unsubscribe();
    this.messagerieSubscription?.unsubscribe();
  }

  private async loadProfile() {
    try {
      const profile = await this.profileService.getProfile();
      this.profilePhotoUrl = profile.photo
        ? `${profile.photo}?${new Date().getTime()}`
        : 'images/default-profile.png';
    } catch (error) {
      console.error('Erreur de chargement du profil', error);
      this.profilePhotoUrl = 'images/default-profile.png';
    }
  }

  smoothScroll(event: any): void {
    event.preventDefault();
    const targetId = event.target.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }
private async initMessagerieNotifications() {
  try {
    await this.messagerieService.connect();
    this.messagerieSubscription = this.messagerieService.getUnreadCounts().subscribe({
      next: (counts: { [conversationId: string]: number }) => {
        const newTotal = Object.values(counts).reduce((sum, count) => sum + count, 0);
        console.log('Nouveau total de messages non lus:', newTotal); // <-- Debug
        if (newTotal > this.totalUnreadMessages) {
          this.isPulsing = true;
          setTimeout(() => this.isPulsing = false, 500);
        }
        this.totalUnreadMessages = newTotal;
      },
      error: (err) => console.error('Erreur notifications messagerie:', err)
    });
    this.messagerieService.requestUnreadCounts();
  } catch (err) {
    console.error('Erreur initialisation messagerie:', err);
  }
}
}




/**
 
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private API = 'http://localhost:3000/profile';

  constructor(private http: HttpClient) {}

  

  getProfile(): Promise<any> {
    return firstValueFrom(this.http.get(this.API));
  }

  updateProfilePhoto(photoData: FormData): Promise<any> {
    return firstValueFrom(this.http.patch(${this.API}/update-photo, photoData));
  }
  
  

}

 */