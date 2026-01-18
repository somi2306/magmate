// page-product-details-admin.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService1 } from '../../marketplace/services/product1.service'; // Utiliser le service existant
import { Produit } from '../../marketplace/models/produit.model'; // Importer le modèle Produit
import { CommentService } from '../../marketplace/services/comment.service'; // Importer CommentService
import { Avis } from '../../marketplace/models/avis.model'; // Importer le modèle Avis

@Component({
  selector: 'app-page-product-details-admin',
  standalone: false,
  templateUrl: './page-product-details-admin.component.html',
  styleUrls: ['./page-product-details-admin.component.css'] // Correction de styleUrl à styleUrls
})
export class PageProductDetailsAdminComponent implements OnInit {
  productId!: number;
  product!: Produit;
  errorMessage: string | null = null;
  comments: Avis[] = []; // Ajouter un tableau pour les commentaires

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService1, // Utiliser le service existant pour les produits
    private commentService: CommentService // Injecter CommentService
  ) {}

  ngOnInit(): void {
    this.productId = +this.route.snapshot.paramMap.get('id')!; // Récupérer l'ID du produit depuis l'URL
    if (this.productId) {
      this.loadProductDetails();
      this.loadComments(); // Charger les commentaires lorsque les détails du produit sont chargés
    } else {
      this.errorMessage = 'ID du produit non fourni.';
    }
  }

  loadProductDetails(): void {
    this.productService.getProductById(this.productId).subscribe({
      next: (data: Produit) => {
        this.product = data;
        // Si l'image principale n'est pas définie mais qu'il y a des images supplémentaires, utiliser la première
        if (!this.product.imagePrincipale && this.product.images && this.product.images.length > 0) {
          this.product.imagePrincipale = this.product.images[0].imageURL;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des détails du produit:', error);
        this.errorMessage = 'Impossible de charger les détails du produit. Veuillez réessayer plus tard.';
      }
    });
  }

  loadComments(): void {
    this.commentService.getCommentsByProductId(this.productId).subscribe({ //
      next: (data: Avis[]) => { //
        this.comments = data; //
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commentaires:', error);
      }
    });
  }

  selectImage(thumbnailImage: { imageURL: string }): void {
    if (this.product) {
      this.product.imagePrincipale = 'http://localhost:3000/public/images/' + thumbnailImage.imageURL;
    }
  }

  deleteComment(commentId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      this.commentService.deleteComment(commentId).subscribe({ //
        next: () => {
          alert('Commentaire supprimé avec succès.');
          this.loadComments(); // Recharger les commentaires après suppression
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du commentaire:', error);
          alert('Une erreur est survenue lors de la suppression du commentaire.');
        }
      });
    }
  }
}