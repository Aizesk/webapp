export interface AuthProvider {
  readonly id: string;
  readonly label: string;
  /**
   * Identifier of the icon that child components can use to
   * render provider-specific artwork.
   */
  readonly icon?: 'google' | 'apple' | 'microsoft' | string;
  readonly disabled?: boolean;
}
