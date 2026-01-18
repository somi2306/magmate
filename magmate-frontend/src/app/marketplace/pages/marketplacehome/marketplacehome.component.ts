// marketplace frontend/pages/marketplacehome/marketplacehome.component.ts
import { Component, OnInit } from '@angular/core';
import { ProductService, Produit } from '../../services/ProductService';
import { MagasinService } from '../../services/MagasinService';
import { AuthService } from '../../../auth/auth.service';
import { Router } from '@angular/router';
import { Magasin } from '../../models/magasin.model'; // Importer le modèle Magasin

@Component({
  selector: 'app-marketplacehome',
  standalone: false,
  templateUrl: './marketplacehome.component.html',
  styleUrls: ['./marketplacehome.component.css'],
})
export class MarketplaceComponent implements OnInit {
  produits: Produit[] = [];
  search = '';
  selectedVille: string = '';
  villes: string[] = [
    'Casablanca',
    'Rabat',
    'Fès',
    'Marrakech',
    'Safi',
    'Tanger',
    'Essaouira',
    'Agadir',
    'Chefchaouen',
  ];
  magasin: Magasin | null = null; // Assurez-nous que le type est Magasin ou null
  message: string = ''; //
  showPopup: boolean = false; //
  showMagasinPopup: boolean = false; //

  userId: string | null = null; //

  // Définir l'ID de l'administrateur (peut être configuré ou récupéré via une API)
  private adminId: string = '6f3e7ea2-d6fd-44a9-b82a-4a9c7c20d9d4';

  constructor(
    private productService: ProductService,
    private magasinService: MagasinService,
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadProduits(); //
  }

  loadProduits(): void {
    console.log('Recherche avec :', this.search, 'Ville :', this.selectedVille); //

    this.productService.getProduits(this.search, this.selectedVille).subscribe(
      (data) => {
        console.log('Produits récupérés:', data); //
        this.produits = data; //
      },
      (error) => {
        console.error('Erreur lors de la récupération des produits :', error); //
      }
    );
  }

  checkUserAuthentication(action: string, produitId?: number): void {
    this.authService.getIdToken().then((token) => {
      if (token) {
        this.userId = token; //

        if (action === 'monMagasin') {
          this.openStorePopup(); //
        } else if (action === 'voirDetails' && produitId) {
          this.router.navigate(['/produit', produitId]); //
        }
      } else {
        this.router.navigate(['/login']); //
      }
    });
  }

  openStorePopup() {
    const userString = localStorage.getItem('user') || sessionStorage.getItem('user'); //
  
    if (!userString) {
      this.router.navigate(['/login']); //
      return;
    }
  
    const user = JSON.parse(userString); //
    const email = user.email; //
  
    this.magasinService.getUuidByEmail(email).subscribe({
      next: (response) => {
        const userId = response.uuid; //
        console.log(userId); //
  
        this.magasinService.getMagasinByUser(userId).subscribe({
          next: (magasin: Magasin | null) => { // Spécifier le type de retour
            if (magasin) {
              if (magasin.estApprouve === 'approved') { // Vérifier le statut 'approved'
                this.router.navigate(['/magasin', magasin.idMagasin]); //
              } else if (magasin.estApprouve === 'pending') { // Nouveau statut 'pending'
                this.message = 'Votre magasin est en attente d\'approbation.'; //
                this.showPopup = true; //
              } else if (magasin.estApprouve === 'rejected') { // Nouveau statut 'rejected'
                this.message = 'Votre magasin a été rejeté. Veuillez contacter l\'administrateur pour plus d\'informations.'; //
                this.showPopup = true; //
              }
            } else {
              this.message = 'Nous n\'avons pas trouvé de magasin associé à notre compte. Veuillez en créer un.'; //
              this.showMagasinPopup = true; //
            }
          },
          error: (err) => {
            console.error('Erreur récupération magasin', err); //
            this.showMagasinPopup = true; //
          },
        });
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de l\'UUID :', err); //
      }
    });
  }
  
  closePopup() {
    this.showPopup = false; //
  }

  scrollToProduits() {
    const produitsSection = document.querySelector('.search-bar'); //
    if (produitsSection) {
      produitsSection.scrollIntoView({ behavior: 'smooth' }); //
    }
  }

  voirDetails(produitId: number): void {
    this.authService.getIdToken().then((token) => {
      if (token) {
        console.log('Utilisateur connecté, redirection vers product-details'); //
        this.router.navigate(['/produit', produitId]); //
      } else {
        console.log('Utilisateur non connecté, redirection vers login'); //
        this.router.navigate(['/login']); //
      }
    });
  }

  contactAdmin(): void {
    this.router.navigate(['/messagerie'], {
      queryParams: { recipientId: this.adminId }
    });
    this.closePopup(); // Fermer le pop-up après avoir cliqué
  }
}