import { Component, OnInit, AfterViewInit, HostListener, ViewChild, ElementRef } from '@angular/core';
import Swiper from 'swiper';
import { CommonModule } from '@angular/common';
import ScrollReveal from 'scrollreveal';
import { ViewEncapsulation } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Importez HttpClient
import { FormsModule } from '@angular/forms'; // Importez FormsModule

interface Temoignage {
  idTemoignage?: string;
  commentaire: string;
  note?: number;
  dateCreation?: Date;
  auteur: {
    id: string;
    fname: string;
    lname: string;
    email: string;
    photo?: string;
  };
}

@Component({
  standalone: true,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule] // Ajoutez FormsModule ici
})
export class HomeComponent implements OnInit, AfterViewInit {
  isMenuOpen = false;
  currentLanguage: 'french' | 'arabic' = 'arabic';
  isVideoPlaying = false;
  temoignages: Temoignage[] = [];
  newTemoignage: { commentaire: string; note?: number } = { commentaire: '', note: 5 }; // Valeurs initiales

  @ViewChild('navLinks') navLinks!: ElementRef;
  @ViewChild('menuBtnIcon') menuBtnIcon!: ElementRef;
  @ViewChild('headerVideo') headerVideo!: ElementRef;
  @ViewChild('headerImage') headerImage!: ElementRef;
  @ViewChild('translateBtn') translateBtn!: ElementRef;
  @ViewChild('arabicParagraph') arabicParagraph!: ElementRef;
  @ViewChild('frenchParagraph') frenchParagraph!: ElementRef;
@ViewChild('temoignageCarousel') temoignageCarousel!: ElementRef;

scrollRight(): void {
  const container = this.temoignageCarousel.nativeElement;
  const scrollWidth = container.scrollWidth;
  const currentScroll = container.scrollLeft;
  const cardWidth = container.firstElementChild?.offsetWidth || 300;

  if (currentScroll + container.offsetWidth >= scrollWidth - cardWidth) {
    // retour au début
    container.scrollTo({ left: 0, behavior: 'smooth' });
  } else {
    container.scrollBy({ left: cardWidth + 16, behavior: 'smooth' });
  }
}

scrollLeft(): void {
  const container = this.temoignageCarousel.nativeElement;
  const cardWidth = container.firstElementChild?.offsetWidth || 300;

  if (container.scrollLeft <= 0) {
    // aller à la fin
    container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
  } else {
    container.scrollBy({ left: -cardWidth - 16, behavior: 'smooth' });
  }
}

  constructor(private http: HttpClient) { } // Injectez HttpClient

  ngOnInit(): void {
    this.initScrollReveal();
    this.loadTemoignages(); // Charge les témoignages au démarrage
  }

  ngAfterViewInit(): void {
    this.initSwiper();
    this.initVideo();
    this.initAutoTranslate();
    this.setupMenuToggle();
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

  private setupMenuToggle(): void {
    const menuBtn = document.getElementById("menu-btn");
    const navLinks = document.getElementById("nav-links");
    const menuBtnIcon = menuBtn?.querySelector("i");

    menuBtn?.addEventListener("click", (e) => {
      navLinks?.classList.toggle("open");

      const isOpen = navLinks?.classList.contains("open");
      if (menuBtnIcon) {
        menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-line");
      }
    });

    navLinks?.addEventListener("click", (e) => {
      navLinks?.classList.remove("open");
      if (menuBtnIcon) {
        menuBtnIcon.setAttribute("class", "ri-menu-line");
      }
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.updateMenuIcon();
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    this.updateMenuIcon();
  }

  private updateMenuIcon(): void {
    if (this.menuBtnIcon) {
      this.menuBtnIcon.nativeElement.className = this.isMenuOpen ? 'ri-close-line' : 'ri-menu-line';
    }
  }

  toggleLanguage(): void {
    this.currentLanguage = this.currentLanguage === 'french' ? 'arabic' : 'french';

    setTimeout(() => {
      ScrollReveal().reveal(".showcase__content p", {
        origin: "bottom",
        distance: "50px",
        duration: 500,
        delay: 600
      });
    }, 15);
  }

  private initScrollReveal(): void {
    const scrollRevealOption = {
      origin: "bottom",
      distance: "50px",
      duration: 1000,
      reset: true
    };

    ScrollReveal().reveal(".header__image img", {
      ...scrollRevealOption,
      origin: "right",
    });
    ScrollReveal().reveal(".header__content p", {
      ...scrollRevealOption,
      delay: 500,
    });
    ScrollReveal().reveal(".header__content h1", {
      ...scrollRevealOption,
      delay: 1000,
    });
    ScrollReveal().reveal(".header__btns", {
      ...scrollRevealOption,
      delay: 1500,
    });
    ScrollReveal().reveal(".destination__card", {
      ...scrollRevealOption,
      interval: 500,
    });
    ScrollReveal().reveal(".showcase__image img", {
      ...scrollRevealOption,
      origin: "left",
    });
    ScrollReveal().reveal(".showcase__content h4", {
      ...scrollRevealOption,
      delay: 500,
    });
    ScrollReveal().reveal(".showcase__content p", {
      ...scrollRevealOption,
      delay: 1000,
    });
    ScrollReveal().reveal(".showcase__btn", {
      ...scrollRevealOption,
      delay: 1500,
    });
    ScrollReveal().reveal(".banner__card", {
      ...scrollRevealOption,
      interval: 500,
    });
    ScrollReveal().reveal(".discover__card", {
      ...scrollRevealOption,
      interval: 500,
    });
  }

  private initSwiper(): void {
    new Swiper('.swiper', {
      slidesPerView: 3,
      spaceBetween: 20,
      loop: true,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
    });
  }

  private initVideo(): void {
    if (this.headerVideo) {
      const videoElement = this.headerVideo.nativeElement;
      videoElement.muted = true;
      videoElement.play().then(() => {
        console.log("La vidéo a commencé à jouer.");
        this.isVideoPlaying = true;
      }).catch((e: any) => {
        console.log("Erreur lors de la lecture de la vidéo :", e);
        if (this.headerImage) {
          this.headerImage.nativeElement.style.display = 'block';
        }
      });
    }
  }

  private initAutoTranslate(): void {
    let count = 0;
    const interval = setInterval(() => {
      if (count >= 3) {
        clearInterval(interval);
        return;
      }
      this.toggleLanguage();
      count++;
    }, 50);
  }

  @HostListener('window:visibilitychange', ['$event'])
  onVisibilityChange(): void {
    if (this.headerVideo) {
      if (document.hidden && this.isVideoPlaying) {
        this.headerVideo.nativeElement.pause();
      } else if (!document.hidden && this.isVideoPlaying) {
        this.headerVideo.nativeElement.play();
      }
    }
  }

  // Nouvelle méthode pour charger les témoignages depuis le backend
  loadTemoignages(): void {
    this.http.get<Temoignage[]>('http://localhost:3000/temoignages').subscribe({
      next: (data) => {
        this.temoignages = data;
        // Réinitialiser Swiper après le chargement des données
        this.initSwiper(); 
      },
      error: (error) => {
        console.error('Erreur lors du chargement des témoignages:', error);
      }
    });
  }

  // Nouvelle méthode pour ajouter un témoignage
  addTemoignage(): void {
    // Supposons que vous avez un token d'authentification (e.g., Firebase ID token)
    // Vous devrez obtenir ce token de Firebase Auth dans votre application Angular
    const authToken = 'YOUR_FIREBASE_ID_TOKEN'; // Remplacez par votre vrai token

    if (!authToken) {
      console.error('Aucun token d\'authentification trouvé. Veuillez vous connecter.');
      alert('Veuillez vous connecter pour ajouter un témoignage.');
      return;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    });

    this.http.post<Temoignage>('http://localhost:3000/temoignages', this.newTemoignage, { headers }).subscribe({
      next: (response) => {
        console.log('Témoignage ajouté avec succès:', response);
        alert('Témoignage ajouté avec succès !');
        this.newTemoignage = { commentaire: '', note: 5 }; // Réinitialiser le formulaire
        this.loadTemoignages(); // Recharger les témoignages pour afficher le nouveau
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout du témoignage:', error);
        alert('Erreur lors de l\'ajout du témoignage. Veuillez réessayer.');
      }
    });
  }
}