import { 
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor // Clase base para interceptores
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service'; // <-- Ajusta la ruta si es necesario
import { Injectable } from '@angular/core';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {} // Inyecta tu AuthService

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 1. Obtenemos el token del AuthService
    const authToken = this.authService.getToken();

    // 2. Clonamos la petición y añade la cabecera de Autorización si existe un token
    //    Es importante 'clonar' la petición porque las peticiones son inmutables en Angular
    if (authToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}` // Formato estándar: "Bearer TU_TOKEN_JWT"
        }
      });
    }

    // 3. Pasamos la petición (modificada o no) al siguiente manejador de la cadena
    return next.handle(request);
  }
}

