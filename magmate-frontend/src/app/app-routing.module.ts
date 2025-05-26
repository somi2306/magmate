import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { TranslationCurrencyComponent } from './components/translation-currency/translation-currency.component';
import { SignupComponent } from './auth/signup/signup.component';
import { LoginComponent } from './auth/login/login.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { ProfileComponent } from './profile/profile.component';
import { MessagerieComponent } from './components/messagerie/messagerie.component';
import { PrestataireDetailsComponent } from './prestataire/pages/prestatairedetails/prestataire-details.component';
import { AuthGuard } from './auth/guards/auth.guard';
import { ProductDetailsComponent } from './marketplace/pages/product-details/product-details.component'; // Importation de votre composant de détails de produit
import { MarketplaceComponent } from './marketplace/pages/marketplacehome/marketplacehome.component';
import { AccueilPrestataireComponent } from './prestataire/pages/accueil-prestataire/accueil-prestataire.component';
import { ConnectionProfileComponent } from './components/connection-profile/connection-profile.component';
import { ConnectionSendComponent } from './components/connection-send/connection-send.component';
import { ConnectionRequestsComponent } from './components/connection-requests/connection-requests.component';
import { EventsListComponent } from './events/events-list/events-list.component';
import { EventsCreateComponent } from './events/events-create/events-create.component';
import { EventsDetailsComponent } from './events/events-details/events-details.compnent';
import { MyEventsComponent } from './events/my-events/my-events.component';
import { MyFavoritesComponent } from './events/my-favorites/my-favorites.component';

const routes: Routes = [
  { path: 'translation-currency', component: TranslationCurrencyComponent },
  { path: '', component: HomeComponent },
  { path: 'prestataires', component: AccueilPrestataireComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'connectionProfile', component: ConnectionProfileComponent },

  // Wildcard : { path: '**', redirectTo: '/login' },
  {
    path: 'messagerie',
    component: MessagerieComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'send-connection',
    component: ConnectionSendComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'connection-requests',
    component: ConnectionRequestsComponent,
    canActivate: [AuthGuard], 
  },
  { path: 'product/:id', component: ProductDetailsComponent }, // Route dynamique pour afficher les détails du produit

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
    path: 'events/my-favorites',
    component: MyFavoritesComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'events/edit/:id',
    component: EventsCreateComponent,
    canActivate: [AuthGuard],
  },

  { path: 'events/:id', component: EventsDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

//{ path: '**', redirectTo: '/login' },

// autres routes...
