import {
  IconInfoCircle,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconLogin,
  IconRefresh,
  IconPlus,
  IconUser,
  IconShieldCheck,
  IconCalendar,
  IconBox,
  IconId,
  IconGitCommit,
} from '@tabler/icons-react';
import type { JSX } from 'react';

export const PAGE_SIZE = 10;

export const severityColors = {
  INFO: 'blue',
  WARNING: 'yellow',
  ERROR: 'red',
  SUCCESS: 'green',
};
export const severityIcons = {
  INFO: <IconInfoCircle size={16} />,
  WARNING: <IconAlertTriangle size={16} />,
  ERROR: <IconX size={16} />,
  SUCCESS: <IconCheck size={16} />,
};
export const severityLabels: Record<string, string> = {
  INFO: 'INFORMACIÓN',
  WARNING: 'ADVERTENCIA',
  ERROR: 'ERROR',
  SUCCESS: 'ÉXITO',
};
export const statusLabels: Record<string, string> = {
  SUCCESS: 'ÉXITO',
  ERROR: 'ERROR',
};
export const moduleLabels: Record<string, string> = {
  AUTH: 'AUTENTICACIÓN',
  FILES: 'ARCHIVOS',
  PRISONERS: 'PRISIONEROS',
  IDENTITY: 'IDENTIDAD',
  USERS: 'USUARIOS',
};
export const actionLabels: Record<string, string> = {
  LOGIN: 'INICIO DE SESIÓN',
  LOGOUT: 'CIERRE DE SESIÓN',
  CREATE: 'CREAR',
  FILE_UPLOAD: 'SUBIR ARCHIVO',
  PRISONER_REGISTERED: 'PRISIONERO REGISTRADO',
  TOKEN_REFRESHED: 'TOKEN ACTUALIZADO',
  USER_DELETED: 'USUARIO ELIMINADO',
};
export const entityLabels: Record<string, string> = {
  USER: 'USUARIO',
  FILE: 'ARCHIVO',
  PRISONER: 'PRISIONERO',
  PRISONER_IDENTITY: 'IDENTIDAD DE PRISIONERO',
};

export const iconMap: Record<string, JSX.Element> = {
  LOGIN: <IconLogin size={16} />,
  TOKEN_REFRESHED: <IconRefresh size={16} />,
  CREATE: <IconPlus size={16} />,
  BELONGING_REGISTERED: <IconBox size={16} />,
  USER_CREATED: <IconUser size={16} />,
  RELEASE_PROCESSED: <IconShieldCheck size={16} />,
  MONTHLY_REPORT: <IconCalendar size={16} />,
  EXPEDIENT_UPDATED: <IconGitCommit size={16} />,
  PRISONER_REGISTERED: <IconUser size={16} />,
  IDENTITY: <IconId size={16} />,
  CHILDREN: <IconUser size={16} />,
  MEDICAL: <IconShieldCheck size={16} />,
  PERSONAL: <IconUser size={16} />,
  FILE_UPLOAD: <IconBox size={16} />,
};

export function traducirDescripcion(desc: string): string {
  if (!desc) return '';
  return desc
    .replace(
      /User ([^ ]+) logged in successfully/,
      'El usuario $1 inició sesión correctamente'
    )
    .replace(
      /User ([^ ]+) logged out \(USER_LOGOUT\)/,
      'El usuario $1 cerró sesión (USER_LOGOUT)'
    )
    .replace(
      /User ([^ ]+) refreshed authentication token/,
      'El usuario $1 actualizó el token de autenticación'
    )
    .replace(/Prisoner ([^ ]+) registered/, 'Prisionero $1 registrado')
    .replace(
      /Archivo subido: (.+) \((.+)\) para prisoner_identity/,
      'Archivo subido: $1 ($2) para identidad de prisionero'
    )
    .replace(/Identidad creada: (.+)/, 'Identidad creada: $1')
    .replace(
      /User ([^ ]+) \((.+)\) was deleted/,
      'El usuario $1 ($2) fue eliminado'
    );
}
