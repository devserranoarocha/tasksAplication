import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor'; // <-- ¡Importa el Interceptor!


export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Provee HttpClient y habilita el uso de interceptores basados en DI
    provideHttpClient(withInterceptorsFromDi()),
     // Registra AuthInterceptor
    {
      provide: HTTP_INTERCEPTORS, // Token para indicar que es un interceptor
      useClass: AuthInterceptor,  // clase de interceptor
      multi: true                 // Permite registrar múltiples interceptores
    }
    
  ],
};
