/**
 * Response from backend AuthController after successful login/register.
 * Maps directly to Java: com.aizesk.auth.application.dto.AuthResponse
 */
export interface AuthResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresIn: number;
  readonly tokenType: string;
  readonly userId: string;
  readonly email: string;
  readonly fullName: string;
  readonly roles: string[];
}
