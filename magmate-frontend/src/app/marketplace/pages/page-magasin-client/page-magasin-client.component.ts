import { Component, OnInit } from '@angular/core';
import { MagasinService } from '../../services/MagasinService';
import { ProductService } from '../../services/ProductService';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-page-magasin-client',
  standalone: false,
  templateUrl: './page-magasin-client.component.html',
  styleUrls: ['./page-magasin-client.component.css']  
})
export class PageMagasinClientComponent implements OnInit {
  magasin: any;
  produits: any[] = [];
  error: string | undefined;

  constructor(
    private magasinService: MagasinService,
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const magasinId = Number(this.route.snapshot.paramMap.get('id')); // Conversion en nombre
    if (magasinId) {
      this.loadMagasin(magasinId);
      this.loadProduits(magasinId);
    } else {
      this.error = 'ID de magasin invalide.';
    }
  }

  loadMagasin(magasinId: number): void {
    this.magasinService.getMagasinById(magasinId).subscribe(
      (data) => {
        this.magasin = data;
      },
      (error) => {
        this.error = 'Magasin introuvable.';
      }
    );
  }

  loadProduits(magasinId: number): void {
    this.productService.getProduitsByMagasin(magasinId).subscribe(
      (data) => {
        this.produits = data;
      },
      (error) => {
        this.error = 'Impossible de récupérer les produits.';
      }
    );
  }
}
