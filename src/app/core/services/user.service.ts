import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * User profile response from backend.
 * Maps to Java: com.aizesk.user.application.dto.UserProfileResponse
 */
export interface UserProfile {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly phone: string | null;
  readonly role: string;
  readonly plan: string;
  readonly location: string | null;
  readonly joinedAt: string;
  readonly avatarInitials: string;
  readonly avatarUrl: string | null;
  readonly lastUpdate: string;
  readonly address: UserAddress | null;
  readonly preferences: UserPreferences | null;
}

export interface UserAddress {
  readonly street: string | null;
  readonly city: string | null;
  readonly state: string | null;
  readonly postalCode: string | null;
  readonly country: string | null;
}

export interface UserPreferences {
  readonly language: string;
  readonly timezone: string;
  readonly currency: string;
  readonly emailNotifications: boolean;
  readonly pushNotifications: boolean;
  readonly theme: string;
}

export interface UpdateProfileRequest {
  readonly fullName?: string;
  readonly phone?: string;
  readonly address?: UserAddress;
}

export interface ChangePasswordRequest {
  readonly currentPassword: string;
  readonly newPassword: string;
  readonly confirmPassword: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = environment.apiUrls.users;

  // Reactive state
  private readonly _profile = signal<UserProfile | null>(null);
  private readonly _loading = signal<boolean>(false);

  readonly profile = this._profile.asReadonly();
  readonly loading = this._loading.asReadonly();

  constructor(private readonly http: HttpClient) {}

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
   * Upload avatar image.
   */
  uploadAvatar(file: File): Observable<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<{ avatarUrl: string }>(`${this.apiUrl}/avatar`, formData).pipe(
      tap(response => {
        const currentProfile = this._profile();
        if (currentProfile) {
          this._profile.set({ ...currentProfile, avatarUrl: response.avatarUrl });
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
   * Get active sessions.
   */
  getActiveSessions(): Observable<ActiveSession[]> {
    return this.http.get<ActiveSession[]>(`${this.apiUrl}/sessions`).pipe(
      catchError(this.handleError)
    );
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

export interface ActiveSession {
  readonly sessionId: string;
  readonly deviceInfo: string;
  readonly ipAddress: string;
  readonly lastActivity: string;
  readonly current: boolean;
}
