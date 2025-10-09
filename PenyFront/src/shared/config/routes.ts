export const ROUTES = {
  LOGIN: '/',
  HOME: '/inicio',
  PRISONERS: '/reclusos',
  REPORTS: '/reportes',
  USERS: '/usuarios',
  ACTIVITY: '/actividad-global',
  PROFILE: '/perfil',
} as const;

// Solo dos tipos de usuario (basado en tu userUtils)
export type UserRole = 'admin' | 'secretario general';

// Definir tipos para permisos
export type Permission = 
  | 'view_dashboard'
  | 'manage_prisoners'
  | 'view_reports'
  | 'manage_users'
  | 'view_activity'
  | 'manage_profile';

// Definición de permisos por rol
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'view_dashboard',
    'manage_prisoners',
    'view_reports', 
    'manage_users',
    'view_activity',
    'manage_profile'
  ],
  'secretario general': [
    'view_dashboard',
    'manage_prisoners', 
    'view_reports',
    'manage_profile'
  ]
};

export const NAV_LINKS = [
  { path: ROUTES.HOME, label: 'Panel principal', permission: 'view_dashboard' },
  { path: ROUTES.PRISONERS, label: 'Reclusos', permission: 'manage_prisoners' },
  { path: ROUTES.REPORTS, label: 'Reportes', permission: 'view_reports' },
  { path: ROUTES.USERS, label: 'Usuarios', permission: 'manage_users' },
  { path: ROUTES.ACTIVITY, label: 'Actividad Global', permission: 'view_activity' },
] as const;

// Tipo para los enlaces de navegación con permisos
export interface NavLink {
  path: string;
  label: string;
  permission: Permission;
  icon: string;
}

// Enlaces completos con iconos (para el componente Navigation si lo usas)
export const ALL_NAV_LINKS: NavLink[] = [
  { 
    path: ROUTES.HOME, 
    label: 'Panel principal',
    permission: 'view_dashboard',
    icon: 'home'
  },
  { 
    path: ROUTES.PRISONERS, 
    label: 'Reclusos',
    permission: 'manage_prisoners',
    icon: 'users'
  },
  { 
    path: ROUTES.REPORTS, 
    label: 'Reportes',
    permission: 'view_reports',
    icon: 'file-text'
  },
  { 
    path: ROUTES.USERS, 
    label: 'Usuarios',
    permission: 'manage_users',
    icon: 'user-cog'
  },
  { 
    path: ROUTES.ACTIVITY, 
    label: 'Actividad Global',
    permission: 'view_activity',
    icon: 'activity'
  }
];

export const DEFAULT_AUTHENTICATED_ROUTE = ROUTES.HOME;
export const DEFAULT_PUBLIC_ROUTE = ROUTES.LOGIN;