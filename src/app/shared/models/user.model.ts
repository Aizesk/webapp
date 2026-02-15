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
    readonly plan?: string;
    readonly location: string | null;
    readonly joinedAt: string;
    readonly lastLoginAt: string | null;
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
    readonly billingAlerts: boolean;
    readonly weeklyDigest: boolean;
    readonly securityEvents: boolean;
    readonly productResearch: boolean;
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

export interface AvatarUploadResponse {
    readonly avatarUrl: string;
    readonly message: string;
}
