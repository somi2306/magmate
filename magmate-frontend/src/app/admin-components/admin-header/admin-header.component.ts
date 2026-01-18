import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProfileService } from '../../profile/profile.service';
import { AuthService } from '../../auth/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Subscription } from 'rxjs';
import { MessagerieService } from '../../components/messagerie/services/messagerie.service';

@Component({
  selector: 'app-admin-header',
  standalone: false,
  templateUrl: './admin-header.component.html',
  styleUrl: './admin-header.component.css'
})
export class AdminHeaderComponent implements OnInit, OnDestroy{
profilePhotoUrl: string | null = null;
  private profileUpdateSubscription: Subscription | null = null;
  private authSubscription: Subscription | null = null;
  private authStateSubscription: Subscription | null = null;
  showDropdown = false;
  showMarketplaceDropdown = false; // <-- Nouvelle propriété
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
    if (this.showDropdown) { // Ferme l'autre dropdown si celle-ci s'ouvre
        this.hideMarketplaceDropdown();
    }
  }

  hideDropdown(): void {
    this.showDropdown = false;
  }

  // Nouvelle méthode pour le menu déroulant Marketplace
  toggleMarketplaceDropdown(event: Event): void {
    event.preventDefault(); // Empêche le comportement par défaut du lien
    this.showMarketplaceDropdown = !this.showMarketplaceDropdown;
    if (this.showMarketplaceDropdown) { // Ferme l'autre dropdown si celle-ci s'ouvre
        this.hideDropdown();
    }
  }

  // Nouvelle méthode pour masquer le menu déroulant Marketplace
  hideMarketplaceDropdown(): void {
    this.showMarketplaceDropdown = false;
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
      await this.initMessagerieNotifications();
    } else {
      this.profilePhotoUrl = 'images/default-profile.png';
      this.totalUnreadMessages = 0;
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
        console.log('Nouveau total de messages non lus:', newTotal);
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