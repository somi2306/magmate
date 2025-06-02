import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common'; 

import { ProductCardComponent } from './components/product-card/product-card.component'; 
import { MarketplaceRoutingModule } from './marketplace-routing.module';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import { MarketplaceComponent } from './pages/marketplacehome/marketplacehome.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from '../components/header/header.component';
import { MagasinPageComponent } from './pages/magasin-page/magasin-page.component';
import { ProductFormComponent } from './pages/product-form/product-form.component';
import { ProductUpdateComponent } from './pages/product-update/product-update.component'; // Exemple d'autres composants
import { MagasinFormComponent } from './pages/magasin-form/magasin-form.component';
import { MagasinUpdateComponent } from './pages/magasin-update/magasin-update.component';

import { ReactiveFormsModule } from '@angular/forms';  
import { PageMagasinClientComponent } from './pages/page-magasin-client/page-magasin-client.component';
import { PageMagasinAdminComponent } from '../admin-components/page-magasin-admin/page-magasin-admin.component'; // Import the new component

@NgModule({
  declarations: [
    
    ProductUpdateComponent,
    MagasinUpdateComponent,
    ProductFormComponent,
    MagasinFormComponent,  
    ProductDetailsComponent,
    ProductCardComponent,
    MarketplaceComponent,
    MagasinPageComponent,
    PageMagasinClientComponent,
    //PageMagasinAdminComponent
  ],
  imports: [
    CommonModule,  
    MarketplaceRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule,
    MarketplaceRoutingModule,
  ],
  exports: [
    ProductDetailsComponent,
    MarketplaceComponent,
    ProductUpdateComponent,
    MagasinUpdateComponent,
    MagasinFormComponent,
    ProductFormComponent, 

  ]
})
export class MarketplaceModule {}

