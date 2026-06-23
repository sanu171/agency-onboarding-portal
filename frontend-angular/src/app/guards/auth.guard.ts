import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, take, switchMap, of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait until token validation has completed (isLoading flips to false)
  // before deciding whether the user is authenticated.
  return toObservable(authService.isLoading).pipe(
    filter(loading => !loading),   // wait until loading is done
    take(1),
    switchMap(() => {
      if (authService.isAuthenticated()) {
        return of(true);
      }
      router.navigate(['/login']);
      return of(false);
    })
  );
};
