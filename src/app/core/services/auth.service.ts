import { Injectable, signal, computed, inject, Injector } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, of } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginCredentials } from '../../shared/models/login-credentials.model';
import { SignUpRequest } from '../../shared/models/sign-up-request.model';
import { AuthResponse } from '../../shared/models/auth-response.model';
import { ActiveSession, ActiveSessionListResponse } from '../../shared/models/session.model';
import { NOTIFICATION_LIFECYCLE, NotificationLifecycle } from './notification.token';
import { SESSION_MONITOR, SessionMonitorLifecycle } from './session-monitor.token';

// Re-export session models so existing consumers don't break
export type { ActiveSession, ActiveSessionListResponse } from '../../shared/models/session.model';

const TOKEN_KEY = 'aizesk_access_token';
const REFRESH_TOKEN_KEY = 'aizesk_refresh_token';
const USER_KEY = 'aizesk_user';


interface StoredUser {
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrls.auth;
  private readonly injector = inject(Injector);

  // Reactive state
  private readonly _isAuthenticated = signal<boolean>(this.hasValidToken());
  private readonly _currentUser = signal<StoredUser | null>(this.loadStoredUser());

  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._isAuthenticated());

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) { }

  /**
   * Lazily resolve NotificationService via injection token to avoid circular dependency
   * (NotificationService injects AuthService, so we can't inject it directly).
   */
  private _notificationService?: NotificationLifecycle;
  private _sessionMonitor?: SessionMonitorLifecycle;

  private getNotificationService(): NotificationLifecycle | null {
    if (!this._notificationService) {
      try {
        this._notificationService = this.injector.get(NOTIFICATION_LIFECYCLE);
      } catch {
        return null;
      }
    }
    return this._notificationService;
  }

  private getSessionMonitor(): SessionMonitorLifecycle | null {
    if (!this._sessionMonitor) {
      try {
        this._sessionMonitor = this.injector.get(SESSION_MONITOR);
      } catch {
        return null;
      }
    }
    return this._sessionMonitor;
  }

  /**
   * Login with email/password credentials.
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => this.handleAuthSuccess(response, credentials.rememberSession)),
      catchError((err) => this.handleError(err)),
    );
  }

  /**
   * Register a new user account.
   */
  register(request: SignUpRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap((response) => this.handleAuthSuccess(response, false)),
      catchError(this.handleError),
    );
  }

  /**
   * Refresh the access token using the stored refresh token.
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap((response) => this.storeTokens(response)),
      catchError((err) => {
        this.logout();
        return throwError(() => err);
      }),
    );
  }

  /**
   * Initializes the authentication state by validating the stored token.
   * This is called on app startup to avoid 'ghost' sessions.
   */
  initialize(): Observable<boolean> {
    const token = this.getAccessToken();
    if (!token) {
      this.clearStorage();
      this._isAuthenticated.set(false);
      this._currentUser.set(null);
      return of(false);
    }

    // Call validation endpoint
    return this.http.post<{ valid: boolean }>(`${this.apiUrl}/validate`, {}).pipe(
      tap((response) => {
        if (!response.valid) {
          this.logout();
        } else {
          this._isAuthenticated.set(true);
        }
      }),
      switchMap(response => of(response.valid)),
      catchError(() => {
        this.logout();
        return of(false);
      })
    );
  }

  /**
   * Logout and clear all stored credentials.
   * Calls the backend to invalidate the session, then clears local storage.
   */
  logout(): void {
    const refreshToken = this.getRefreshToken();

    // Call backend logout (fire-and-forget - don't wait for response)
    if (refreshToken) {
      this.http
        .post<{ success: boolean; message: string }>(`${this.apiUrl}/logout`, { refreshToken })
        .pipe(catchError(() => of({ success: false, message: 'Logout request failed' })))
        .subscribe({
          next: (response) => {
            if (!environment.production) {
              console.log('Logout response:', response);
            }
          },
        });
    }

    // Clear local storage immediately (don't wait for backend)
    this.clearStorage();
    this._isAuthenticated.set(false);
    this._currentUser.set(null);

    // Disconnect WebSocket and clear cached notification state
    this.getNotificationService()?.reset();

    // Stop session monitor
    this.getSessionMonitor()?.stop();

    this.router.navigate(['/login']);
  }

  /**
   * Request password recovery email.
   */
  requestPasswordRecovery(email: string): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.apiUrl}/recovery-password`, { email })
      .pipe(catchError(this.handleError));
  }

  /**
   * OAuth login with external provider.
   */
  oauthLogin(provider: string, idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/oauth/${provider}`, { idToken }).pipe(
      tap((response) => this.handleAuthSuccess(response, true)),
      catchError(this.handleError),
    );
  }

  /**
   * Change password for authenticated user.
   */
  changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
  ): Observable<void> {
    return this.http
      .post<void>(`${this.apiUrl}/change-password`, {
        currentPassword,
        newPassword,
        confirmPassword,
      })
      .pipe(catchError(this.handleError));
  }

  // ========== Session Management ==========

  /**
   * Get all active sessions for the current user.
   */
  getActiveSessions(): Observable<ActiveSessionListResponse> {
    return this.http
      .get<ActiveSessionListResponse>(`${this.apiUrl}/sessions`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Revoke (close) a specific session by its ID.
   */
  revokeSession(sessionId: string): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/sessions/${sessionId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Revoke all sessions except the current one.
   */
  revokeAllOtherSessions(): Observable<{ revokedCount: number; message: string }> {
    return this.http
      .delete<{ revokedCount: number; message: string }>(`${this.apiUrl}/sessions`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get the stored access token.
   */
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
  }

  /**
   * Get the stored refresh token.
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Check if user has a specific role.
   */
  hasRole(role: string): boolean {
    const user = this._currentUser();
    return user?.roles.includes(role) ?? false;
  }

  // ========== Private Methods ==========

  private handleAuthSuccess(response: AuthResponse, remember: boolean): void {
    this.storeTokens(response, remember);
    this.storeUser(response, remember);
    this._isAuthenticated.set(true);
    this._currentUser.set({
      userId: response.userId,
      email: response.email,
      fullName: response.fullName,
      roles: response.roles,
    });

    // (Re)connect WebSocket for the new user's notifications
    const notifService = this.getNotificationService();
    if (notifService) {
      notifService.reset(); // clear any stale state from previous user
      notifService.initRealtimeConnection(); // open fresh connection for new user
    }

    // Start session monitor to detect remote session revocation
    this.getSessionMonitor()?.start();
  }

  private storeTokens(response: AuthResponse, remember: boolean = true): void {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(TOKEN_KEY, response.accessToken);
    storage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
  }

  private storeUser(response: AuthResponse, remember: boolean): void {
    const user: StoredUser = {
      userId: response.userId,
      email: response.email,
      fullName: response.fullName,
      roles: response.roles,
    };
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(USER_KEY, JSON.stringify(user));
  }

  private loadStoredUser(): StoredUser | null {
    const userJson = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson) as StoredUser;
      } catch {
        return null;
      }
    }
    return null;
  }

  private hasValidToken(): boolean {
    return !!this.getAccessToken();
  }

  private clearStorage(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An error occurred';
    if (error.error?.message) {
      message = error.error.message;
    } else if (error.status === 401) {
      message = 'Invalid credentials';
    } else if (error.status === 403) {
      message = 'Access denied';
    } else if (error.status === 0) {
      message = 'Unable to connect to server';
    }
    return throwError(() => new Error(message));
  }
}
