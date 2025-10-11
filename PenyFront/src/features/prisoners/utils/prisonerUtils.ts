import type { PrisonerStatus } from '../types'; // 🔧 Importar desde tipos unificados

// 🔧 Función corregida para manejar todos los status posibles
export const getStatusColor = (status: PrisonerStatus): string => {
  switch (status) {
    case 'Activo':
      return 'green';
    case 'Inactivo':
      return 'gray';
    case 'En Proceso':
      return 'yellow';
    case 'Liberado':
      return 'blue';
    case 'Transferido':
      return 'purple';
    default:
      return 'gray';
  }
};

// Otras funciones de utilidad que puedas necesitar
export const formatPrisonerDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Fecha inválida';
  }
};

export const calculateTimeInPrison = (admissionDate: string): string => {
  try {
    const admission = new Date(admissionDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - admission.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} días`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} mes${months > 1 ? 'es' : ''}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years} año${years > 1 ? 's' : ''} ${remainingMonths > 0 ? `${remainingMonths} mes${remainingMonths > 1 ? 'es' : ''}` : ''}`.trim();
    }
  } catch {
    return 'No calculado';
  }
};

export const getStatusFilterOptions = () => {
  return [
    { value: 'Activo', label: 'Activo' },
    { value: 'Inactivo', label: 'Inactivo' },
    { value: 'En Proceso', label: 'En Proceso' },
    { value: 'Liberado', label: 'Liberado' },
    { value: 'Transferido', label: 'Transferido' }
  ];
};
