import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { MarketplaceModule } from './marketplace/marketplace.module';
//import { HomeComponent } from './components/home/home.component';



import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { IonicModule } from '@ionic/angular';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore'; // Added
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AuthInterceptor } from './auth/Interceptor/auth.interceptor';
import { environment } from '../environments/environment';



// Components
import { AuthComponent } from './auth/auth.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home.component';
import { TranslationCurrencyComponent } from './components/translation-currency/translation-currency.component';
import { MessagerieComponent } from './components/messagerie/messagerie.component';
import { PrestataireModule } from './prestataire/prestataire.module';

//


import {SocketIoConfig, SocketIoModule} from "ngx-socket-io";
import { ConnectionProfileComponent } from './components/connection-profile/connection-profile.component';
import { ConnectionSendComponent } from './components/connection-send/connection-send.component';
import { ConnectionRequestsComponent } from './components/connection-requests/connection-requests.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslationComponent } from './components/translation/translation.component';
import { CurrencyComponent } from './components/currency/currency.component';

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
const socketConfig: SocketIoConfig = {
  url: 'http://localhost:3000/messagerie', // Notez le namespace
  options: {
    path: '/socket.io',
    transports: ['websocket'],
    autoConnect: true
  }
};


@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    AppComponent,

    LoginComponent,
   
    AuthComponent,
    LoginComponent,
    SignupComponent,
    ResetPasswordComponent,
    DashboardComponent,
    ProfileComponent,
    HeaderComponent,
    FooterComponent,
    ConnectionProfileComponent,
    ConnectionSendComponent,
    ConnectionRequestsComponent,


    
    
  ],
  imports: [
    HomeComponent, // Moved from imports to declarations
    TranslationCurrencyComponent, // Moved from imports to declarations
        TranslationComponent,
    CurrencyComponent,
    MessagerieComponent,//check
    BrowserModule,
    CommonModule,
    
    MarketplaceModule,
     // Supprime la duplication
    FormsModule,

    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    PickerModule,
    IonicModule.forRoot(),
    SocketIoModule.forRoot(socketConfig),
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule, // Added for Firestore support
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    
    IonicModule,
    FormsModule,
    CommonModule,        // ✅ for *ngIf, *ngFor, ngClass, etc.
    ReactiveFormsModule,
                InitialPipe,
    InitialsPipe,

    PrestataireModule

    
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
