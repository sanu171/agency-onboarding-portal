import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * Auth Interceptor:
 * - Attaches the Bearer token from AuthService to every outgoing HttpClient request.
 * - On 401 → auto-logout and redirect to /login?reason=session_expired
 * - On 403 → shows a permission-denied toast notification
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);

  const token = auth.user()?.token;

  // Clone the request and attach the Authorization header if token exists
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Session is no longer valid — log out and redirect
        auth.logout();
        router.navigate(['/login'], { queryParams: { reason: 'session_expired' } });
      } else if (error.status === 403) {
        toast.add('You don\'t have permission to perform this action.', 'error');
      }
      return throwError(() => error);
    })
  );
};
