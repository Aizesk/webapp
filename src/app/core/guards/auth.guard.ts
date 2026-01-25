import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Route guard that prevents access to protected routes for unauthenticated users.
 * Redirects to login page if user is not authenticated.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirecting after login
  router.navigate(['/login']);
  return false;
};

/**
 * Route guard that prevents authenticated users from accessing public-only routes.
 * Redirects to home page if user is already authenticated.
 * Useful for login/register pages.
 */
export const publicOnlyGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // User is already authenticated, redirect to home
  router.navigate(['/inicio']);
  return false;
};
