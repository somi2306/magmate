import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { TranslationCurrencyComponent } from './components/translation-currency/translation-currency.component';

// src/app/app-routing.module.ts

import { FormsModule } from '@angular/forms';

import { SignupComponent } from './auth/signup/signup.component';
import { LoginComponent } from './auth/login/login.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { ProfileComponent } from './profile/profile.component';


import { MessagerieComponent } from './components/messagerie/messagerie.component';
import{PrestataireDetailsComponent}from './prestataire/pages/prestatairedetails/prestataire-details.component';
import { AuthGuard } from './auth/guards/auth.guard';

import { ProductDetailsComponent } from './marketplace/pages/product-details/product-details.component';  // Importation de votre composant de détails de produit

import { MarketplaceComponent } from './marketplace/pages/marketplacehome/marketplacehome.component';



import { AccueilPrestataireComponent } from './prestataire/pages/accueil-prestataire/accueil-prestataire.component';

import{MagasinFormComponent} from './marketplace/pages/magasin-form/magasin-form.component';
import { ProductFormComponent } from './marketplace/pages/product-form/product-form.component';
import { ProductUpdateComponent } from './marketplace/pages/product-update/product-update.component';
import { ConnectionProfileComponent } from './components/connection-profile/connection-profile.component';
import { ConnectionSendComponent } from './components/connection-send/connection-send.component';
import { ConnectionRequestsComponent } from './components/connection-requests/connection-requests.component';
import { EventsListComponent } from './events/events-list/events-list.component';
import { EventsCreateComponent } from './events/events-create/events-create.component';
import { EventsDetailsComponent } from './events/events-details/events-details.compnent';
import { MyEventsComponent } from './events/my-events/my-events.component';
import { MyFavoritesComponent } from './events/my-favorites/my-favorites.component';
import { TranslationComponent } from './components/translation/translation.component';
import { CurrencyComponent } from './components/currency/currency.component';
const routes: Routes = [
  
  { path: 'translation-currency', component: TranslationCurrencyComponent },
  { path: 'translation', component: TranslationComponent },
  { path: 'currency', component: CurrencyComponent },

  { path: '', component: HomeComponent },
  { path: 'prestataires', component: AccueilPrestataireComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'connectionProfile', component: ConnectionProfileComponent },
 
  
  // Wildcard : { path: '**', redirectTo: '/login' },
  { path: 'messagerie', component: MessagerieComponent, canActivate: [AuthGuard] },
  
    

    { 
      path: 'send-connection', 
      component: ConnectionSendComponent,
      
    },
    { 
      path: 'connection-requests', 
      component: ConnectionRequestsComponent,
      
    },
    { path: 'product/:id', component: ProductDetailsComponent },  // Route dynamique pour afficher les détails du produit

  { path: 'prestataires/:uuid', component: PrestataireDetailsComponent },
  { path: '', component: HomeComponent },
  { path: 'marketplace', component: MarketplaceComponent },
  { path: 'events', component: EventsListComponent },
  {
    path: 'events/create',
    component: EventsCreateComponent,
    canActivate: [AuthGuard],
  },
  { path: 'events/my', component: MyEventsComponent, canActivate: [AuthGuard] },
  {
    path: 'events/edit/:id',
    component: EventsCreateComponent,
    canActivate: [AuthGuard],
  },

  {
    path: 'events/my-favorites',
    component: MyFavoritesComponent, // Remplacez par le nom réel de votre composant favoris
    canActivate: [AuthGuard],
  },
  { path: 'events/:id', component: EventsDetailsComponent },
  { path: '**', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

  
  //{ path: '**', redirectTo: '/login' },

  // autres routes...
