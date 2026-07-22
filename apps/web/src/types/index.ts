export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserPrincipal {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  disabled?: boolean;
}
