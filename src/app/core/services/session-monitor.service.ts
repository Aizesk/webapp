import { Injectable, inject, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { Subscription, interval, switchMap, catchError, of, filter } from 'rxjs';

/**
 * Monitors the current session's validity by polling the backend.
 * If the session has been remotely revoked (e.g., from another browser),
 * it forces a local logout.
 *
 * Starts automatically when the user is authenticated.
 * Polls every 10 seconds.
 */
@Injectable({ providedIn: 'root' })
export class SessionMonitorService implements OnDestroy {
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);
    private readonly apiUrl = environment.apiUrls.auth;

    private pollSubscription: Subscription | null = null;
    private readonly POLL_INTERVAL_MS = 10_000; // 10 seconds

    /**
     * Start polling. Called after successful login.
     */
    start(): void {
        this.stop(); // Ensure no duplicate polling

        this.pollSubscription = interval(this.POLL_INTERVAL_MS)
            .pipe(
                // Only poll if the user is authenticated
                filter(() => this.authService.isAuthenticated()),
                switchMap(() =>
                    this.http
                        .get<{ active: boolean }>(`${this.apiUrl}/sessions/check`)
                        .pipe(
                            catchError(() => {
                                // Network error or 401 — don't force logout on transient failures
                                return of(null);
                            })
                        )
                )
            )
            .subscribe((response) => {
                if (response && response.active === false) {
                    console.warn('[SessionMonitor] Session revoked remotely. Forcing logout.');
                    this.stop();
                    this.authService.logout();
                }
            });
    }

    /**
     * Stop polling. Called on logout.
     */
    stop(): void {
        if (this.pollSubscription) {
            this.pollSubscription.unsubscribe();
            this.pollSubscription = null;
        }
    }

    ngOnDestroy(): void {
        this.stop();
    }
}
