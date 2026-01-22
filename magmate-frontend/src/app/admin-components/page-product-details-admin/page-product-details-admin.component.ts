// page-product-details-admin.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService1 } from '../../marketplace/services/product1.service'; 
import { Produit } from '../../marketplace/models/produit.model'; 
import { CommentService } from '../../marketplace/services/comment.service'; 
import { Avis } from '../../marketplace/models/avis.model'; 

@Component({
  selector: 'app-page-product-details-admin',
  standalone: false,
  templateUrl: './page-product-details-admin.component.html',
  styleUrls: ['./page-product-details-admin.component.css']
})
export class PageProductDetailsAdminComponent implements OnInit {
  productId!: number;
  product!: Produit;
  errorMessage: string | null = null;
  comments: Avis[] = [];

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService1,
    private commentService: CommentService
  ) {}

  ngOnInit(): void {
    this.productId = +this.route.snapshot.paramMap.get('id')!;
    if (this.productId) {
      this.loadProductDetails();
      this.loadComments();
    } else {
      this.errorMessage = 'ID du produit non fourni.';
    }
  }

  loadProductDetails(): void {
    this.productService.getProductById(this.productId).subscribe({
      next: (data: Produit) => {
        this.product = data;
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
    this.commentService.getCommentsByProductId(this.productId).subscribe({
      next: (data: Avis[]) => {
        this.comments = data;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des commentaires:', error);
      }
    });
  }

  /**
   * CORRECTION CLOUDINARY
   * On ne rajoute plus le préfixe localhost car l'URL est déjà complète
   */
  selectImage(thumbnailImage: { imageURL: string }): void {
    if (this.product) {
      // Utilisation directe de l'URL stockée (Cloudinary)
      this.product.imagePrincipale = thumbnailImage.imageURL;
    }
  }

  deleteComment(commentId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      this.commentService.deleteComment(commentId).subscribe({
        next: () => {
          alert('Commentaire supprimé avec succès.');
          this.loadComments();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du commentaire:', error);
          alert('Une erreur est survenue lors de la suppression du commentaire.');
        }
      });
    }
  }
}