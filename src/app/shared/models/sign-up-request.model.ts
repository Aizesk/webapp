export interface SignUpRequest {
  readonly fullName: string;
  readonly lastName: string;
  readonly email: string;
  readonly password: string;
  readonly address?: string;
  readonly country?: string;
  readonly phone?: string;
  readonly jobTitle?: string;
  readonly acceptTerms: boolean;
}
