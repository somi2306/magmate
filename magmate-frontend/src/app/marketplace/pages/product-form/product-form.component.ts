import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AlertService } from '../../services/alerte.service';

@Component({
  selector: 'app-product-create',
  standalone: false,
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  alertMessage: string | null = null;
  alertType: 'success' | 'error' | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private alertService: AlertService, // Injection du service
    private router: Router,
    private route: ActivatedRoute 
  ) {
    this.productForm = this.fb.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      prix: ['', [Validators.required, Validators.min(0)]],
      imagePrincipale: ['', Validators.required], // Image principale requise
      images: ['', Validators.required],  // Images supplémentaires sont optionnelles
      magasinIdMagasin: ['', Validators.required] // ID du magasin est requis
    });
  }

  ngOnInit(): void {
    // S'abonner à l'alerte
    const magasinId = this.route.snapshot.paramMap.get('id');
    if (magasinId) {
      this.productForm.patchValue({ magasinIdMagasin: magasinId });
    }
    this.alertService.alert$.subscribe(alert => {
      this.alertMessage = alert.message;
      this.alertType = alert.type;
    });
  }

  onFileChange(event: any): void {
    const file = event.target.files[0]; // Get the first file (main image)
    if (file) {
      this.productForm.patchValue({
        imagePrincipale: file // Set the selected file to the imagePrincipale control
      });
    }
  }

  onFilesChange(event: any): void {
    const files = event.target.files;
    if (files.length > 0) {
      const fileArray = Array.from(files);
      this.productForm.patchValue({
        images: fileArray // Set the selected files (additional images) to the images control
      });
    }
  }

  onSubmit() {
    if (this.productForm.invalid) {
      return;
    }

    const productData = new FormData();  // Create FormData to append the product data

    // Append non-file form fields
    productData.append('titre', this.productForm.get('titre')?.value);
    productData.append('description', this.productForm.get('description')?.value);
    productData.append('prix', this.productForm.get('prix')?.value);
    productData.append('magasinIdMagasin', this.productForm.get('magasinIdMagasin')?.value);

    // Append main image
    const imagePrincipale = this.productForm.get('imagePrincipale')?.value;
    if (imagePrincipale && imagePrincipale instanceof File) {
      //console.log('Main Image:', imagePrincipale);
      productData.append('imagePrincipale', imagePrincipale, imagePrincipale.name);  // Append main image
    } else {
      console.error('Main image is invalid or missing');
    }

    // Append additional images
    const imagesArray = this.productForm.get('images')?.value;
    if (imagesArray && imagesArray instanceof Array) {
      //console.log('Additional Images:', imagesArray);
      imagesArray.forEach((image: File) => {
        productData.append('images', image, image.name);  // Append each additional image
        //console.log('Added Image:', image);
      });
    } else {
      console.error('No additional images or invalid structure');
    }

    //console.log('Data sent to server:', productData);  // Log the FormData before sending

    // Send the data to the backend via the service
    this.productService.createProduct(productData).subscribe({
      next: (response) => {
        //console.log('Product successfully created', response);
        this.alertService.success('votre produit est ajouté avec succée');
        this.router.navigate(['/magasin']);  // Navigate after successful creation
      },
      error: (error) => {
        console.error('Error creating product', error);
        this.alertService.error('il y avait un erreur lors de la création');
      }
    });
  }

  // Méthode pour fermer l'alerte
  closeAlert() {
    this.alertMessage = null;
    this.alertType = null;
  }
}
