import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError(err => {
      if (err.status === 401) {
        localStorage.removeItem('kadiar_token');
        localStorage.removeItem('kadiar_user');
        router.navigate(['/connexion']);
      } else if (err.status === 403) {
        toast.error('Accès interdit. Vous n\'avez pas les droits nécessaires.');
      } else if (err.status === 422) {
        const errors = err.error?.errors;
        if (errors) {
          const msg = Object.values(errors).flat().join(', ');
          toast.error(msg);
        } else {
          toast.error(err.error?.message || 'Données invalides.');
        }
      } else if (err.status >= 500) {
        toast.error('Erreur serveur. Veuillez réessayer.');
      }

      return throwError(() => err);
    })
  );
};
