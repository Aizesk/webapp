import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginCredentials } from '../../shared/models/login-credentials.model';
import { SignUpRequest } from '../../shared/models/sign-up-request.model';
import { AuthResponse } from '../../shared/models/auth-response.model';

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

  // Reactive state
  private readonly _isAuthenticated = signal<boolean>(this.hasValidToken());
  private readonly _currentUser = signal<StoredUser | null>(this.loadStoredUser());

  readonly isAuthenticated = this._isAuthenticated.asReadonly();
  readonly currentUser = this._currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this._isAuthenticated());

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  /**
   * Login with email/password credentials.
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response, credentials.rememberSession)),
      catchError(this.handleError)
    );
  }

  /**
   * Register a new user account.
   */
  register(request: SignUpRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => this.handleAuthSuccess(response, false)),
      catchError(this.handleError)
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
      tap(response => this.storeTokens(response)),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  /**
   * Logout and clear all stored credentials.
   */
  logout(): void {
    this.clearStorage();
    this._isAuthenticated.set(false);
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Request password recovery email.
   */
  requestPasswordRecovery(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/recovery-password`, { email }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * OAuth login with external provider.
   */
  oauthLogin(provider: string, token: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/oauth/${provider}`, { token }).pipe(
      tap(response => this.handleAuthSuccess(response, true)),
      catchError(this.handleError)
    );
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
      roles: response.roles
    });
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
      roles: response.roles
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
