import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  UserProfile,
  UserPreferences,
  UpdateProfileRequest,
  ChangePasswordRequest,
  AvatarUploadResponse,
} from '../../shared/models/user.model';

// Re-export models so existing consumers don't break
export type {
  UserProfile,
  UserAddress,
  UserPreferences,
  UpdateProfileRequest,
  ChangePasswordRequest,
  AvatarUploadResponse,
} from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = environment.apiUrls.users;

  // Reactive state
  private readonly _profile = signal<UserProfile | null>(null);
  private readonly _loading = signal<boolean>(false);

  readonly profile = this._profile.asReadonly();
  readonly loading = this._loading.asReadonly();

  constructor(private readonly http: HttpClient) { }

  /**
   * Fetch current user's profile from backend.
   */
  getProfile(): Observable<UserProfile> {
    this._loading.set(true);
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`).pipe(
      tap(profile => {
        this._profile.set(profile);
        this._loading.set(false);
      }),
      catchError(err => {
        this._loading.set(false);
        return this.handleError(err);
      })
    );
  }

  /**
   * Update user profile.
   */
  updateProfile(request: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/profile`, request).pipe(
      tap(profile => this._profile.set(profile)),
      catchError(this.handleError)
    );
  }

  /**
   * Change user password.
   */
  changePassword(request: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/password/change`, request).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get user preferences.
   */
  getPreferences(): Observable<UserPreferences> {
    return this.http.get<UserPreferences>(`${this.apiUrl}/preferences`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Update user preferences.
   */
  updatePreferences(preferences: Partial<UserPreferences>): Observable<UserPreferences> {
    return this.http.put<UserPreferences>(`${this.apiUrl}/preferences`, preferences).pipe(
      tap(prefs => {
        const currentProfile = this._profile();
        if (currentProfile) {
          this._profile.set({ ...currentProfile, preferences: prefs });
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Upload avatar image as multipart form data.
   * The backend stores it as a BLOB in the database.
   */
  uploadAvatar(file: File): Observable<AvatarUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<AvatarUploadResponse>(`${this.apiUrl}/avatar`, formData).pipe(
      tap(response => {
        const currentProfile = this._profile();
        if (currentProfile) {
          // Add timestamp to bust browser cache
          const avatarUrl = response.avatarUrl + '?t=' + Date.now();
          this._profile.set({ ...currentProfile, avatarUrl });
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete avatar.
   */
  deleteAvatar(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/avatar`).pipe(
      tap(() => {
        const currentProfile = this._profile();
        if (currentProfile) {
          this._profile.set({ ...currentProfile, avatarUrl: null });
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Build full avatar URL from relative path.
   * The backend returns relative URLs like /api/v1/users/{id}/avatar
   */
  getAvatarFullUrl(avatarUrl: string | null): string | null {
    if (!avatarUrl) return null;
    // If it's already an absolute URL, return as-is
    if (avatarUrl.startsWith('http')) return avatarUrl;
    // Build full URL from the user-service base
    const baseUrl = this.apiUrl.replace('/api/v1/users', '');
    return baseUrl + avatarUrl;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'An error occurred';
    if (error.error?.message) {
      message = error.error.message;
    } else if (error.status === 401) {
      message = 'Unauthorized - Please login again';
    } else if (error.status === 404) {
      message = 'User not found';
    }
    return throwError(() => new Error(message));
  }
}
