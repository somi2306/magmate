import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service'; // Votre service API
import { AlertService } from '../../services/alerte.service';  // Service pour afficher les alertes
import { switchMap } from 'rxjs/operators'; // Pour chaîner les appels

@Component({
  selector: 'app-product-update',
  standalone: false,
  templateUrl: './product-update.component.html',
  styleUrls: ['./product-update.component.scss']
})
export class ProductUpdateComponent implements OnInit {
  productForm: FormGroup;
  imagePreview: string | null = null;
  selectedImages: { file: File; preview: string }[] = [];
  existingImages: string[] = [];  // Pour stocker les URLs des images existantes
  productId!: number ;
  alertMessage: string | null = null;
  alertType: 'success' | 'error' | null = null;
  imageFile: any;


  constructor(
    private alertService: AlertService,
    private fb: FormBuilder,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute // Pour récupérer l'ID du produit depuis l'URL
  ) {
    this.productForm = this.fb.group({
      titre: ['', Validators.nullValidator],  // No validation, optional field
      description: ['', Validators.nullValidator],  // No validation, optional field
      prix: ['', [Validators.nullValidator, Validators.min(0)]],  // Optional, with a validation for min value if entered
      imagePrincipale: [null, Validators.nullValidator],  // No validation, optional field
      images: [null, Validators.nullValidator],  // No validation, optional field
    });
    
  }

  ngOnInit(): void {
    // Récupérer l'ID du produit depuis l'URL
    this.route.paramMap.subscribe(params => {
      this.productId = +params.get('id')!;  // Forcer le casting vers un nombre
      this.loadProductData();  // Charger les données du produit
    });
    this.alertService.alert$.subscribe(alert => {
      this.alertMessage = alert.message;
      this.alertType = alert.type;
    });
  }

  // Récupérer les informations du produit par son ID
// ... (reste du code identique)

  // Récupérer les informations du produit par son ID
  loadProductData(): void {
    console.log('Chargement du produit avec ID :', this.productId);
    
    this.productService.getProductById(this.productId).subscribe(product => {
      // Remplir le formulaire avec les données récupérées
      this.productForm.patchValue({
        titre: product.titre,
        description: product.description,
        prix: product.prix
      });

      // L'image principale est déjà une URL complète
      this.imagePreview = product.imagePrincipale ? product.imagePrincipale : null;

      // Les images de la galerie sont déjà des URLs complètes
      if (product.images) {
        this.existingImages = product.images.map((image: any) => image.imageURL);
      }
    });
  }

// ... (reste du code identique)

  onFileChange(event: any): void {
    const file = event.target.files[0];  // Get the first file (main image)
    if (file) {
      this.imagePreview = URL.createObjectURL(file);  // Create a URL for the image preview
  
      // Store the selected file in a local variable (do not use patchValue for file input)
      this.imageFile = file;  // Store the file here
    }
  }
  
  
  onFilesChange(event: any): void {
    const files = event.target.files;
    if (files.length > 0) {
      const fileArray = Array.from(files);
      this.selectedImages = fileArray.map((file: unknown) => {
        // Type assertion
        const typedFile = file as File;
        return {
          file: typedFile,
          preview: URL.createObjectURL(typedFile) // Create a preview URL for the image
        };
      });
    }
  }
  
  

  // Soumettre le formulaire pour mettre à jour le produit
  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }

    const productData = new FormData();
    productData.append('titre', this.productForm.get('titre')?.value);
    productData.append('description', this.productForm.get('description')?.value);
    productData.append('prix', this.productForm.get('prix')?.value);

    if (this.imageFile) {
      productData.append('imagePrincipale', this.imageFile, this.imageFile.name);
    }
    
    if (this.selectedImages.length > 0) {
      this.selectedImages.forEach(imageObj => {
        productData.append('images', imageObj.file, imageObj.file.name);
      });
    }
    

    // Envoyer les données à l'API
    this.productService.updateProduct(this.productId, productData).subscribe({
      next: (response) => {
        console.log('Produit mis à jour avec succès', response);
        this.alertService.success('Le produit a été mis à jour avec succès!');
        this.router.navigate(['/magasin']);
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du produit', error);
        this.alertService.error('Une erreur est survenue lors de la mise à jour du produit.');
      }
    });
  }
  closeAlert() {
    this.alertMessage = null;
    this.alertType = null;
  }
}
