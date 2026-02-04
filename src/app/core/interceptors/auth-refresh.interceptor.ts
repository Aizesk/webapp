import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';

/**
 * HTTP Interceptor that handles token refresh on 401 Unauthorized responses.
 * When a request fails with 401, it attempts to refresh the access token
 * and retry the original request.
 * 
 * This interceptor handles multiple concurrent requests that fail with 401
 * by queuing them until the token refresh completes.
 */

// Track whether we're currently refreshing the token
let isRefreshing = false;
const refreshSubject = new BehaviorSubject<string | null>(null);

export const authRefreshInterceptor: HttpInterceptorFn = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
) => {
    const authService = inject(AuthService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            // Only handle 401 Unauthorized errors
            if (error.status !== 401) {
                return throwError(() => error);
            }

            // Skip refresh for auth endpoints (avoid infinite loop)
            const skipUrls = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/recovery-password'];
            const shouldSkip = skipUrls.some(url => req.url.includes(url));

            if (shouldSkip) {
                return throwError(() => error);
            }

            // Check if we have a refresh token
            const refreshToken = authService.getRefreshToken();
            if (!refreshToken) {
                // No refresh token available, logout
                console.warn('No refresh token available, logging out');
                authService.logout();
                return throwError(() => error);
            }

            // If we're already refreshing, queue this request
            if (isRefreshing) {
                return refreshSubject.pipe(
                    filter(token => token !== null),
                    take(1),
                    switchMap(token => {
                        const clonedReq = req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${token}`
                            }
                        });
                        return next(clonedReq);
                    })
                );
            }

            // Start refresh process
            isRefreshing = true;
            refreshSubject.next(null);

            return authService.refreshToken().pipe(
                switchMap(() => {
                    // Token refreshed successfully, get new token and notify queued requests
                    const newToken = authService.getAccessToken();
                    if (!newToken) {
                        authService.logout();
                        return throwError(() => error);
                    }

                    isRefreshing = false;
                    refreshSubject.next(newToken);

                    // Retry original request with new token
                    const clonedReq = req.clone({
                        setHeaders: {
                            Authorization: `Bearer ${newToken}`
                        }
                    });

                    return next(clonedReq);
                }),
                catchError((refreshError) => {
                    // Refresh failed, reset state and logout user
                    isRefreshing = false;
                    refreshSubject.next(null);

                    console.error('Token refresh failed, logging out');
                    authService.logout();
                    return throwError(() => refreshError);
                })
            );
        })
    );
};
