export interface AppNavItem {
  readonly label: string;
  readonly path: string;
  readonly exact?: boolean;
}

export const MAIN_NAV_ITEMS: ReadonlyArray<AppNavItem> = [
  { label: 'Inicio', path: '/', exact: true },
  { label: 'Dashboard', path: '/main-dashboard' },
  { label: 'Transacciones', path: '/transactions' },
  { label: 'Conexiones', path: '/api-connections' },
  { label: 'Informes', path: '/reports' }
];
