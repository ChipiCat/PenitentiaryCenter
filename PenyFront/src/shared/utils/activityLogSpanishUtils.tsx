import { ThemeIcon } from "@mantine/core";
import { Activity, Upload, Trash2, UserPlus, FileText, Info, ShieldCheck } from "lucide-react";
import type { ActivityLog } from "../types";

export interface Activity {
  id: string;
  action: string;
  module: string;
  ip_address: string;
  description: string;
  details?: string;
  timestamp: string;
  user?: { name?: string };
}

export function getActivityIcon(action: string) {
  switch (action) {
    case "FILE_UPLOAD":
      return <ThemeIcon color="green" variant="light" size="sm"><Upload size={16} /></ThemeIcon>;
    case "FILE_DELETE":
      return <ThemeIcon color="red" variant="light" size="sm"><Trash2 size={16} /></ThemeIcon>;
    case "CREATE":
      return <ThemeIcon color="blue" variant="light" size="sm"><FileText size={16} /></ThemeIcon>;
    case "PRISONER_REGISTERED":
      return <ThemeIcon color="teal" variant="light" size="sm"><UserPlus size={16} /></ThemeIcon>;
    case "INFO":
      return <ThemeIcon color="gray" variant="light" size="sm"><Info size={16} /></ThemeIcon>;
    case "SUCCESS":
      return <ThemeIcon color="indigo" variant="light" size="sm"><ShieldCheck size={16} /></ThemeIcon>;
    default:
      return <ThemeIcon color="gray" variant="light" size="sm"><Activity size={16} /></ThemeIcon>;
  }
}

export function translateLogout(reason: string): string {
  switch (reason) {
    case "USER_LOGOUT": return "Cierre de sesión voluntario";
    case "TOKEN_EXPIRED": return "Token expirado";
    case "SESSION_TIMEOUT": return "Sesión expirada por tiempo";
    case "FORCE_LOGOUT_BY_ADMIN": return "Cierre forzado por administrador";
    case "SUSPICIOUS_ACTIVITY": return "Actividad sospechosa";
    case "PASSWORD_CHANGED": return "Contraseña cambiada";
    case "ACCOUNT_DISABLED": return "Cuenta deshabilitada";
    case "DEVICE_LIMIT_REACHED": return "Límite de dispositivos alcanzado";
    default: return reason || "";
  }
}

export function translateUserAction(activity: ActivityLog): string {
  if (!activity) return "";
  if (activity.action === "LOGIN" && activity.user?.name)
    return `El usuario ${activity.user.name} inició sesión correctamente`;
  if (activity.action === "LOGOUT" && activity.user?.name)
    return `El usuario ${activity.user.name} cerró sesión`;
  if (activity.action === "USER_CREATED") {
    // Si hay nombre, úsalo
    if (activity.user?.name) {
      return `El usuario ${activity.user.name} fue creado`;
    }
    // Si no, intenta extraer de description
    const match = activity.description.match(/User ([^ ]+) \(([^)]+)\) was created/);
    if (match) {
      const email = match[1];
      const nombre = match[2];
      return `El usuario ${nombre} (${email}) fue creado`;
    }
  }
  if (activity.action === "USER_DELETED" && activity.user?.name)
    return `El usuario ${activity.user.name} fue eliminado`;
  if (activity.action === "LOGIN_FAILED")
    return `Intento fallido de inicio de sesión para ${activity.description.split(':')[0].replace('Failed login attempt for ', '').trim()}`;
  if (activity.action === "TOKEN_REFRESHED" && activity.user?.name)
    return `El usuario ${activity.user.name} actualizó el token de autenticación`;
  if (activity.action === "FILE_UPLOAD" || activity.action === "FILE_DELETE")
    return translateFileDetail(activity);
  return translateFullDescription(activity.description);
}

export function translateFileDetail(activity: ActivityLog): string {
  if (activity.action === "FILE_UPLOAD" && activity.description) {
    const match = activity.description.match(/Archivo subido: (.+) \((.+)\) para (.+)/);
    if (match) {
      const nombreArchivo = match[1];
      const tipo = match[2];
      let tipoTraducido = "archivo";
      if (tipo === "mandate_document") tipoTraducido = "mandato";
      else if (tipo === "medical_file") tipoTraducido = "archivo médico";
      return `Archivo subido: ${nombreArchivo} (${tipoTraducido})`;
    }
  }
  if (activity.action === "FILE_DELETE" && activity.description) {
    const match = activity.description.match(/Archivo eliminado: (.+) \((.+)\)/);
    if (match) {
      const nombreArchivo = match[1];
      const tipo = match[2];
      let tipoTraducido = "archivo";
      if (tipo === "mandate_document") tipoTraducido = "mandato";
      else if (tipo === "medical_file") tipoTraducido = "archivo médico";
      return `Archivo eliminado: ${nombreArchivo} (${tipoTraducido})`;
    }
  }
  return translateFullDescription(activity.description);
}

export function translateFullDescription(desc: string): string {
  // Si tienes una función de traducción, úsala aquí
  return desc;
}

export function adaptActivityToActivityLog(activity: Activity): ActivityLog {
  return {
    id: activity.id,
    action: activity.action,
    description: activity.description,
    user: {
      id: "",
      name: activity.user?.name ?? "",
      email: "",
      role: "",
      photoUrl: ""
    },
    entity_type: "",
    entity_id: "",
    severity: "",
    status: "",
    timestamp: activity.timestamp,
    module: activity.module,
    ip_address: activity.ip_address,
    changes: [],
    user_agent: "",
  };
}