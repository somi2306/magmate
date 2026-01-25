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
  styleUrl: './admin-header.component.css' // Correction nom de propriété styleUrl -> styleUrls si ancien Angular, mais styleUrl OK v17+
})
export class AdminHeaderComponent implements OnInit, OnDestroy {
  
  // Variables d'état
  profilePhotoUrl: string | null = null;
  isMenuOpen: boolean = false;
  
  // États des dropdowns
  showDropdown = false; // Profil
  showMarketplaceDropdown = false; 
  showPrestataireDropdown = false;
  showTranslationDropdown = false;

  // Notifications
  totalUnreadMessages = 0;
  isPulsing = false;

  // Subscriptions
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

    // Login events
    this.subscriptions.add(
      this.authService.userLoggedIn.subscribe(async () => {
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

  // --- Gestion des Dropdowns (Logique Mutuelle) ---
  
  // 1. Profil
  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.showMarketplaceDropdown = false;
      this.showPrestataireDropdown = false;
    }
  }

  hideDropdown(): void {
    this.showDropdown = false;
    this.checkIfMenuShouldClose();
  }

  // 2. Marketplace
  toggleMarketplaceDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showMarketplaceDropdown = !this.showMarketplaceDropdown;
    if (this.showMarketplaceDropdown) {
      this.showDropdown = false;
      this.showPrestataireDropdown = false;
    }
  }

  hideMarketplaceDropdown(): void {
    this.showMarketplaceDropdown = false;
    this.checkIfMenuShouldClose();
  }

  // 3. Prestataire
  togglePrestataireDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showPrestataireDropdown = !this.showPrestataireDropdown;
    if (this.showPrestataireDropdown) {
      this.showMarketplaceDropdown = false;
      this.showDropdown = false;
    }
  }

  hidePrestataireDropdown(): void {
    this.showPrestataireDropdown = false;
    this.checkIfMenuShouldClose();
  }

  // Helper pour tout fermer
  private closeAllDropdowns(): void {
    this.showDropdown = false;
    this.showMarketplaceDropdown = false;
    this.showPrestataireDropdown = false;
  }

  // Helper pour fermer le menu mobile si on clique sur un lien final
  private checkIfMenuShouldClose(): void {
    // Optionnel : fermer tout le menu mobile après selection
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