import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { IonicModule } from '@ionic/angular';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { ToastrModule } from 'ngx-toastr';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './auth/Interceptor/auth.interceptor';
import { environment } from '../environments/environment';

// Components (Non-Standalone)
import { AuthComponent } from './auth/auth.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ConnectionProfileComponent } from './components/connection-profile/connection-profile.component';
import { ConnectionSendComponent } from './components/connection-send/connection-send.component';
import { ConnectionRequestsComponent } from './components/connection-requests/connection-requests.component';
import { EventsComponent } from './events/events.component';
import { EventsListComponent } from './events/events-list/events-list.component';
import { EventsCreateComponent } from './events/events-create/events-create.component';
import { EventsDetailsComponent } from './events/events-details/events-details.compnent';
import { MyEventsComponent } from './events/my-events/my-events.component';
import { MyFavoritesComponent } from './events/my-favorites/my-favorites.component';

// Components (Standalone imports)
import { HomeComponent } from './components/home/home.component';
import { TranslationCurrencyComponent } from './components/translation-currency/translation-currency.component';
import { MessagerieComponent } from './components/messagerie/messagerie.component';
import { TranslationComponent } from './components/translation/translation.component';
import { CurrencyComponent } from './components/currency/currency.component';
import { AdminAuthComponent } from './admin-auth/admin-auth.component';
import { AdminHeaderComponent } from './admin-components/admin-header/admin-header.component';
import { AdminProfileComponent } from './admin-components/admin-profile/admin-profile.component';
import { AdminMagasinListComponent } from './admin-components/admin-magasin-list/admin-magasin-list.component';
import { PageMagasinAdminComponent } from './admin-components/page-magasin-admin/page-magasin-admin.component';
import { AdminReclamationListComponent } from './admin-components/admin-reclamation-list/admin-reclamation-list.component';
import { PageProductDetailsAdminComponent } from './admin-components/page-product-details-admin/page-product-details-admin.component';
import { AdminPrestataireListComponent } from './admin-components/admin-prestataire-list/admin-prestataire-list.component';
import { PagePrestataireAdminComponent } from './admin-components/page-prestataire-admin/page-prestataire-admin.component';
import { PagePrestataireDetailsAdminComponent } from './admin-components/page-prestataire-details-admin/page-prestataire-details-admin.component';
import { AdminEventsListComponent } from './admin-components/admin-events-list/admin-events-list.component';
import { PageEventsDetailsAdminComponent } from './admin-components/page-events-details-admin/page-events-details-admin.component';
import { AdminMessagerieComponent } from './admin-components/admin-messagerie/admin-messagerie.component';
import { AdminHomeComponent } from './admin-components/admin-home/admin-home.component';
import { AdminUserListComponent } from './admin-components/admin-user-list/admin-user-list.component';
import { AdminReclamationPrestataireListComponent } from './admin-components/admin-reclamation-prestataire-list/admin-reclamation-prestataire-list.component';

// Modules & Others
import { SocketIoConfig, SocketIoModule } from "ngx-socket-io";
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { Pipe, PipeTransform } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PrestataireModule } from './prestataire/prestataire.module';

// Pipes
@Pipe({
  name: 'initial',
  standalone: true
})
export class InitialPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase();
  }
}

@Pipe({
  name: 'initials',
  standalone: true
})
export class InitialsPipe implements PipeTransform {
  transform(name: string): string {
    if (!name) return '';
    const parts = name.split(' ');
    return parts.map(p => p.charAt(0)).join('').toUpperCase();
  }
}

// Configuration Socket.IO dynamique basée sur l'environnement
// Si apiUrl est 'http://localhost:3000/api', cela donne 'http://localhost:3000/messagerie'
const socketUrl = environment.apiUrl.replace('/api', '') + '/messagerie';

const socketConfig: SocketIoConfig = {
  url: socketUrl, 
  options: {
    path: '/socket.io',
    transports: ['websocket'],
    autoConnect: true
  }
};

@NgModule({
  declarations: [
    AppComponent,
    // Auth
    AuthComponent,
    LoginComponent,
    SignupComponent,
    ResetPasswordComponent,
    // Layout & Dashboard
    DashboardComponent,
    HeaderComponent,
    FooterComponent,
    // Profile & Connections
    ProfileComponent,
    ConnectionProfileComponent,
    ConnectionSendComponent,
    ConnectionRequestsComponent,
    // Events
    EventsComponent,
    EventsListComponent,
    EventsCreateComponent,
    EventsDetailsComponent,
    MyEventsComponent,
    MyFavoritesComponent,
    // Admin Components (Non-Standalone)
    AdminAuthComponent,
    AdminHeaderComponent,
    AdminProfileComponent,
    AdminMagasinListComponent,
    PageMagasinAdminComponent,
    AdminReclamationListComponent,
    PageProductDetailsAdminComponent,
    AdminPrestataireListComponent,
    PagePrestataireAdminComponent,
    PagePrestataireDetailsAdminComponent,
    AdminEventsListComponent,
    PageEventsDetailsAdminComponent,
    AdminUserListComponent
  ],
  imports: [
    // Angular Core
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    
    // Modules Features
    MarketplaceModule,
    PrestataireModule,
    
    // Components Standalone (Importés ici au lieu de declarations)
    HomeComponent,
    TranslationCurrencyComponent,
    TranslationComponent,
    CurrencyComponent,
    MessagerieComponent,
    AdminMessagerieComponent,
    AdminHomeComponent,
    AdminReclamationPrestataireListComponent, // Standalone component
    
    // Pipes Standalone
    InitialPipe,
    InitialsPipe,

    // Libs
    IonicModule.forRoot(),
    PickerModule,
    QRCodeComponent,
    MatCardModule,
    MatIconModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),

    // Firebase
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,

    // Socket.IO
    SocketIoModule.forRoot(socketConfig),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {}