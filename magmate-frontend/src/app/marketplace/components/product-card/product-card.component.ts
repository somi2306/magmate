import { Component, Input } from '@angular/core';
import { Produit } from '../../services/ProductService';

@Component({
  selector: 'app-product-card',
  standalone: false,
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css'],
})
export class ProductCardComponent {
  @Input() produit!: Produit;

  isNewProduct(dateAjout: string): boolean {
    const ajoutDate = new Date(dateAjout);
    const now = new Date();
    const diffInTime = now.getTime() - ajoutDate.getTime();
    const diffInDays = diffInTime / (1000 * 3600 * 24); 
    return diffInDays <= 3; 
  }
}
