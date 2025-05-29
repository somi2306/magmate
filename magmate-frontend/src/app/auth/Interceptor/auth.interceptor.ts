import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Liste des routes qui nécessitent un token
    const protectedRoutes = [
      '/profile',
      '/',
      
      //events
      '/my-events',
      '/events/my-favorites',
      '/events',

      //messagerie
      '/messagerie',
      '/connection-requests',
      '/send-connection',

      //marketplace
      '/product/:id',
      '/product-form/:id',
      '/product-update/:id',
      '/magasin-détails/:id',
      '/magasin-update/:id',
      '/magasin-form',
      '/magasin/:id',
      '/magasin-détails/:id',
      '/creer-magasin',
      

      //prestataire
      '/prestataires/:uuid',
      '/monprofil',

      // pour POST, PUT, DELETE
      // Ajoute ici les autres routes privées
    ];

    // Liste des routes à exclure de l'ajout du token (par exemple, les APIs externes)
    const excludedRoutes = [
      'https://translate.googleapis.com', // Exclure l'API de Google Translate

    ];

    // Pour les requêtes de modification sur /events, le token est requis
    const isProtectedEventModification =
      req.url.includes('/events') &&
      ['POST', 'PUT', 'DELETE'].includes(req.method);

    // Vérifier si la route actuelle doit être exclue
    const isExcluded = excludedRoutes.some((route) => req.url.startsWith(route));

    // Pour les autres routes privées
    const isProtected =
      protectedRoutes.some((route) => req.url.includes(route)) ||
      isProtectedEventModification;

    // Si la route est exclue, ne rien faire et passer la requête telle quelle
    if (isExcluded) {
      return next.handle(req);
    }

    if (isProtected) {
      return from(this.authService.getIdToken()).pipe(
        switchMap((token) => {
          if (token) {
            const cloned = req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`,
              },
            });
            console.log('Token:', token);
            return next.handle(cloned);
          }
          return next.handle(req);
        })
      );
    } else {
      // Pour les routes publiques non exclues, ne rien ajouter
      return next.handle(req);
    }
  }
}