import { Component, OnInit } from '@angular/core';
import { MagasinService } from '../../services/MagasinService';
import { ProductService } from '../../services/ProductService';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-magasin-page',
  standalone: false,
  templateUrl: './magasin-page.component.html',
  styleUrls: ['./magasin-page.component.css'],
})
export class MagasinPageComponent implements OnInit {
  magasin: any = null;
  produits: any[] = [];
  error: string = '';
  userId: string = '';
  magasinId  // Variable pour stocker l'ID de l'utilisateur connecté

  constructor(
    private magasinService: MagasinService,
    private produitService: ProductService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute  // Injection du service AuthService
  ) {}

  ngOnInit(): void {
    this.magasinId = this.route.snapshot.paramMap.get('id')!;
    const userString = localStorage.getItem('user') || sessionStorage.getItem('user');
  
    if (!userString) {
      this.router.navigate(['/login']);
      return;
    }
  
    const user = JSON.parse(userString);
    const email = user.email;
  
    // 1. Récupérer l'UUID par email
    this.magasinService.getUuidByEmail(email).subscribe({
      next: (response) => {
        const uuid = response.uuid;
        this.userId = uuid;
  
        // 2. Charger le magasin avec l’UUID
        this.loadMagasin(uuid);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de l\'UUID :', err);
        this.router.navigate(['/login']);
      }
    });
  }
  navigateToProductForm() {
    // Rediriger vers la page 'product-form' avec l'ID du magasin
    this.router.navigate([`/product-form/${this.magasinId}`]);
  }
  
  loadMagasin(uuid: string): void {
    this.magasinService.getMagasinByUser(uuid).subscribe({
      next: (data) => {
        console.log('Magasin récupéré:', data);
        this.magasin = data;
        if (!this.magasin) {
          this.error = 'Aucun magasin trouvé';
        } else {
          this.loadProduits();  // Charger les produits du magasin
        }
      },
      error: (error) => {
        console.error('Erreur récupération magasin:', error);
        this.error = 'Impossible de charger le magasin';
      }
    });
  }
  
  loadProduits(): void {
    if (!this.magasin?.idMagasin) return;

    this.produitService.getProduitsByMagasin(this.magasin.idMagasin).subscribe(
      (data) => {
        this.produits = data;
      },
      (error) => {
        console.error('Erreur chargement des produits:', error);
      }
    );
  }

  deleteMagasin(idMagasin: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce magasin ?')) {
      this.magasinService.deleteMagasin(idMagasin).subscribe(
        (response) => {
          console.log('Magasin supprimé avec succès', response);
          alert('Magasin supprimé avec succès.');
          this.router.navigate(['/']);
        },
        (error) => {
          console.error('Erreur lors de la suppression du magasin', error);
          alert('Une erreur est survenue lors de la suppression du magasin.');
        }
      );
    }
  }

  deleteProduct(productId: number) {
    if (confirm('Es-tu sûr de vouloir supprimer ce produit ?')) {
      this.produitService.deleteProduct(productId).subscribe({
        next: () => {
          alert('Produit supprimé avec succès');
          this.loadProduits(); // Recharge les produits
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du produit :', error);
          alert('Erreur lors de la suppression du produit ❌');
        }
      });
    }
  }
}