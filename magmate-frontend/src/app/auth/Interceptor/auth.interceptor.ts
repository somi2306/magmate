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

intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  // 1. Ne pas ajouter de token pour les requêtes externes
  const isExternal = !req.url.startsWith('http://localhost:3000') && !req.url.startsWith('/api');
  if (isExternal) {
    return next.handle(req); // ⛔ PAS DE TOKEN
  }

  // 2. Liste des routes publiques (si tu veux affiner plus tard)
  const publicRoutes = ['/translation'];


  const isPublic = publicRoutes.some(route => req.url.includes(route));
  if (isPublic) {
    return next.handle(req); // ⛔ PAS DE TOKEN
  }


  // 3. Sinon, logique standard pour les routes protégées
  const protectedRoutes = [
    '/profile', '/', '/my-events', '/events/my-favorites', '/events',
    '/messagerie', '/connection-requests', '/send-connection',
    '/product/:id', '/product-form/:id', '/product-update/:id',
    '/magasin-détails/:id', '/magasin-update/:id', '/magasin-form',
    '/magasin/:id', '/creer-magasin',
    '/prestataires', '/prestataires/:uuid', '/monprofil',
  ];

  const isProtectedEventModification =
    req.url.includes('/events') &&
    ['POST', 'PUT', 'DELETE'].includes(req.method);

  const isProtected =
    protectedRoutes.some(route => req.url.includes(route)) || isProtectedEventModification;

  if (isProtected) {
    return from(this.authService.getIdToken()).pipe(
      switchMap(token => {
        if (token) {
          const cloned = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          });
          return next.handle(cloned);
        }
        return next.handle(req);
      })
    );
  }

  // Sinon passer la requête sans modification
  return next.handle(req);
}
}

