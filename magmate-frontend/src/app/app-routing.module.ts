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
import { TranslationComponent } from './components/translation/translation.component';
import { CurrencyComponent } from './components/currency/currency.component';

import { AdminAuthComponent } from './admin-auth/admin-auth.component';
import { AdminProfileComponent } from './admin-components/admin-profile/admin-profile.component';
import { AdminMagasinListComponent } from './admin-components/admin-magasin-list/admin-magasin-list.component';
import { AdminReclamationListComponent } from './admin-components/admin-reclamation-list/admin-reclamation-list.component'; // Importer le nouveau composant
import { PageMagasinAdminComponent } from './admin-components/page-magasin-admin/page-magasin-admin.component'; // Import the new component
import { PageProductDetailsAdminComponent } from './admin-components/page-product-details-admin/page-product-details-admin.component'; // Importez le nouveau composant admin
import { AdminPrestataireListComponent } from './admin-components/admin-prestataire-list/admin-prestataire-list.component'; // Importez le nouveau composant
import { PagePrestataireDetailsAdminComponent } from './admin-components/page-prestataire-details-admin/page-prestataire-details-admin.component'; // Assurez-vous que le chemin est correct
import { AdminEventsListComponent } from './admin-components/admin-events-list/admin-events-list.component';
import { PageEventsDetailsAdminComponent } from './admin-components/page-events-details-admin/page-events-details-admin.component';
import { AdminMessagerieComponent } from './admin-components/admin-messagerie/admin-messagerie.component';
import { AdminHomeComponent } from './admin-components/admin-home/admin-home.component';
import { AdminUserListComponent } from './admin-components/admin-user-list/admin-user-list.component';
const routes: Routes = [
  { path: 'translation-currency', component: TranslationCurrencyComponent },
    { path: 'translation', component: TranslationComponent },
  { path: 'currency', component: CurrencyComponent },
  { path: '', component: HomeComponent },
  { path: 'prestataires', component: AccueilPrestataireComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
   { path: 'admin-auth', component: AdminAuthComponent },

  { path: 'admin-profile', component: AdminProfileComponent },
    { 
    path: 'admin/magasins', 
    component: AdminMagasinListComponent,
    // canActivate: [AdminGuard] // Si vous avez un guard pour l'admin
  },
  { path: 'admin/magasin-products/:id', component: PageMagasinAdminComponent }, //

    { path: 'admin/reclamations', component: AdminReclamationListComponent }, //

      // Nouvelle route pour afficher les produits d'un magasin (pour l'admin)
  {
    path: 'admin/produit-details/:id', // Nouvelle route pour les détails du produit admin
    component: PageProductDetailsAdminComponent, // Composant admin
  },
    {path :'admin/prestataires', component:AdminPrestataireListComponent}, // Nouvelle route pour l'admin

  { path: 'admin/prestataire-details/:id', component: PagePrestataireDetailsAdminComponent },

    { path: 'admin/events', component: AdminEventsListComponent },
  { path: 'admin/event-details/:id', component: PageEventsDetailsAdminComponent },

    {
    path: 'admin/messagerie',
    component: AdminMessagerieComponent,

  },

      {
    path: 'admin/home',
    component: AdminHomeComponent,

  },

        {
    path: 'admin/users',
    component: AdminUserListComponent,

  },

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

  { path: 'events/:id', component: EventsDetailsComponent, canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

//{ path: '**', redirectTo: '/login' },

// autres routes...
