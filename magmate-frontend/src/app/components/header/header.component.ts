import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProfileService } from '../../profile/profile.service';
import { AuthService } from '../../auth/auth.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Subscription } from 'rxjs';
import { MessagerieService } from '../messagerie/services/messagerie.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  
  // États
  profilePhotoUrl: string | null = null;
  isMenuOpen: boolean = false; // Pour le menu mobile
  
  // Dropdowns
  showDropdown = false; // Profil
  showTranslationDropdown = false;

  // Notifications
  totalUnreadMessages = 0;
  isPulsing = false;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private afAuth: AngularFireAuth,
    private messagerieService: MessagerieService
  ) {}

  ngOnInit(): void {
    // Auth State change
    this.subscriptions.add(
      this.afAuth.authState.subscribe(async user => {
        if (user) {
          await this.loadProfile();
          await this.initMessagerieNotifications();
        } else {
          this.profilePhotoUrl = 'images/default-profile.png';
          this.totalUnreadMessages = 0;
        }
      })
    );

    // Profile updates
    this.subscriptions.add(
      this.profileService.profileUpdated.subscribe(async () => {
        if (await this.afAuth.currentUser) {
          await this.loadProfile();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // --- Gestion du Menu Mobile Principal ---
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    if (!this.isMenuOpen) {
      this.closeAllDropdowns();
    }
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    this.closeAllDropdowns();
  }

  // --- Gestion des Dropdowns ---

  // 1. Profil
  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.showTranslationDropdown = false;
    }
  }

  hideDropdown(): void {
    this.showDropdown = false;
    this.checkIfMenuShouldClose();
  }

  // 2. Traduction
  toggleTranslationDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showTranslationDropdown = !this.showTranslationDropdown;
    if (this.showTranslationDropdown) {
      this.showDropdown = false;
    }
  }

  hideTranslationDropdown(): void {
    this.showTranslationDropdown = false;
    this.checkIfMenuShouldClose();
  }

  // Helper pour tout fermer
  private closeAllDropdowns(): void {
    this.showDropdown = false;
    this.showTranslationDropdown = false;
  }

  // Fermer le menu mobile si nécessaire
  private checkIfMenuShouldClose(): void {
    this.isMenuOpen = false;
  }

  // --- Chargement Données ---
  private async loadProfile() {
    try {
      const profile = await this.profileService.getProfile();
      this.profilePhotoUrl = profile.photo
        ? `${profile.photo}?${new Date().getTime()}`
        : 'images/default-profile.png';
    } catch (error) {
      console.error('Erreur chargement profil', error);
      this.profilePhotoUrl = 'images/default-profile.png';
    }
  }

  private async initMessagerieNotifications() {
    try {
      await this.messagerieService.connect();
      this.subscriptions.add(
        this.messagerieService.getUnreadCounts().subscribe({
          next: (counts: { [conversationId: string]: number }) => {
            const newTotal = Object.values(counts).reduce((sum, count) => sum + count, 0);
            if (newTotal > this.totalUnreadMessages) {
              this.isPulsing = true;
              setTimeout(() => this.isPulsing = false, 500);
            }
            this.totalUnreadMessages = newTotal;
          },
          error: (err) => console.error('Erreur notifs:', err)
        })
      );
      this.messagerieService.requestUnreadCounts();
    } catch (err) {
      console.error('Erreur init messagerie:', err);
    }
  }
}