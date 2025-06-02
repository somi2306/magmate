// src/app/admin-components/pages/page-magasin-admin/page-magasin-admin.component.ts

import { Component, OnInit } from '@angular/core';
import { MagasinService } from '../../marketplace/services/MagasinService';
import { ProductService } from '../../marketplace/services/ProductService'; // Use the correct ProductService
import { ActivatedRoute, Router } from '@angular/router'; // Import Router
import { ProductService as ProductServiceBackend } from '../../marketplace/services/product.service'; // Alias to avoid naming conflict
import { HttpClient } from '@angular/common/http'; // Import HttpClient for sending emails
import { firstValueFrom } from 'rxjs'; // Import firstValueFrom


@Component({
  selector: 'app-page-magasin-admin',
  standalone: false,
  templateUrl: './page-magasin-admin.component.html',
  styleUrl: './page-magasin-admin.component.css'
})
export class PageMagasinAdminComponent implements OnInit {
  magasin: any;
  produits: any[] = [];
  error: string | undefined;

  constructor(
    private magasinService: MagasinService,
    private productService: ProductService, // Used for fetching products by magasin ID
    private route: ActivatedRoute,
    private productServiceBackend: ProductServiceBackend, // Used for deleting products
    private router: Router, // Inject Router
    private http: HttpClient // Inject HttpClient
  ) { }

  ngOnInit(): void {
    const magasinId = Number(this.route.snapshot.paramMap.get('id')); // Convert to number
    if (magasinId) {
      this.loadMagasin(magasinId); //
      this.loadProduits(magasinId); //
    } else {
      this.error = 'ID de magasin invalide.'; //
    }
  }

  loadMagasin(magasinId: number): void {
    this.magasinService.getMagasinById(magasinId).subscribe(
      (data) => {
        this.magasin = data; //
      },
      (error) => {
        this.error = 'Magasin introuvable.'; //
      }
    );
  }

  loadProduits(magasinId: number): void {
    this.productService.getProduitsByMagasin(magasinId).subscribe(
      (data) => {
        this.produits = data; //
      },
      (error) => {
        this.error = 'Impossible de récupérer les produits.'; //
      }
    );
  }

  deleteProduct(productId: number): void {
    if (confirm('Nous sommes-nous sûrs de vouloir supprimer ce produit ?')) { //
      // Find the product to get its name before deleting
      const productToDelete = this.produits.find(p => p.idProduit === productId);

      this.productServiceBackend.deleteProduct(productId).subscribe({
        next: () => {
          alert('Produit supprimé avec succès ✅'); //
          this.loadProduits(this.magasin.idMagasin); // Reload products after deletion
          // Send email to owner about product deletion
          if (this.magasin && this.magasin.proprietaire?.email && productToDelete) {
            this.sendEmailToProprietaire(
              this.magasin.proprietaire.email,
              `Suppression du produit "${productToDelete.titre}" dans votre magasin "${this.magasin.nom}"`,
              `Bonjour,\n\nNous vous informons que le produit "${productToDelete.titre}" de votre magasin "${this.magasin.nom}" a été supprimé par l'administrateur.\n\nCordialement,\nL'équipe Magmate`
            );
          }
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du produit :', error); //
          alert('Erreur lors de la suppression du produit ❌'); //
        }
      });
    }
  }

  deleteMagasin(idMagasin: number): void {
    if (confirm('Nous sommes-nous sûrs de vouloir supprimer ce magasin et tous ses produits associés ?')) { //
      this.magasinService.deleteMagasin(idMagasin).subscribe( //
        (response) => {
          console.log('Magasin supprimé avec succès', response); //
          alert('Magasin et ses produits associés supprimés avec succès. ✅'); //
          // Send email to owner about store deletion
          if (this.magasin && this.magasin.proprietaire?.email) {
            this.sendEmailToProprietaire(
              this.magasin.proprietaire.email,
              `Suppression de votre magasin "${this.magasin.nom}"`,
              `Bonjour,\n\nNous vous informons que votre magasin "${this.magasin.nom}" et tous ses produits associés ont été supprimés par l'administrateur.\n\nCordialement,\nL'équipe Magmate`
            );
          }
          this.router.navigate(['/admin/dashboard']); // Rediriger l'admin vers le tableau de bord ou une autre page après suppression
        },
        (error) => {
          console.error('Erreur lors de la suppression du magasin :', error); //
          alert('Une erreur est survenue lors de la suppression du magasin. ❌'); //
        }
      );
    }
  }

  async sendEmailToProprietaire(to: string, subject: string, body: string): Promise<void> {
    if (!to) {
      console.error('Email du destinataire non trouvé.');
      return;
    }

    try {
      await firstValueFrom(this.http.post('http://localhost:3000/mail/send-contact-email', {
        to: to,
        subject: subject,
        body: body
      }));
      console.log(`Email envoyé avec succès à ${to} avec le sujet: ${subject}`);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email via l\'API:', error);
      alert('Échec de l\'envoi de l\'email de notification.');
    }
  }
}