import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MagasinPageComponent } from './pages/magasin-page/magasin-page.component';
import { ProductDetailsComponent } from './pages/product-details/product-details.component';
import{MagasinFormComponent} from './pages/magasin-form/magasin-form.component';
import { ProductFormComponent } from './pages/product-form/product-form.component';
import { ProductUpdateComponent } from './pages/product-update/product-update.component';
import { MagasinUpdateComponent } from './pages/magasin-update/magasin-update.component';
import { PageMagasinClientComponent } from './pages/page-magasin-client/page-magasin-client.component';
import { PageMagasinAdminComponent } from './../admin-components/page-magasin-admin/page-magasin-admin.component'; // Import the new component


const routes: Routes = [
  { path: 'product-form/:id', component: ProductFormComponent },
  { path: 'product-update/:id', component: ProductUpdateComponent  },
   { path: 'magasin-update/:id', component: MagasinUpdateComponent  },
  { path: 'magasin-form', component: MagasinFormComponent },
  { path: 'magasin/:id', component: MagasinPageComponent },
    {path :'magasin-détails/:id', component:PageMagasinClientComponent},
  {path :'creer-magasin',component: MagasinFormComponent},
  {
    path: 'produit/:id',
    component: ProductDetailsComponent,
  },
  // Nouvelle route pour afficher les produits d'un magasin (pour l'admin)
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // Utilisation de `forChild` pour les modules enfants
  exports: [RouterModule],
})
export class MarketplaceRoutingModule {}