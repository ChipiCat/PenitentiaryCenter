/**
 * Utilidades para manejo seguro de fechas en formularios
 * 
 * @module dateUtils
 */

/**
 * Convierte una fecha string (ISO 8601) a un objeto Date
 * Maneja formatos: "YYYY-MM-DD", "YYYY-MM-DDTHH:mm:ss", etc.
 * 
 * @param dateString - String de fecha en formato ISO
 * @returns Date object o null si la fecha es inválida o undefined
 */
export const parseISODate = (dateString: string | undefined | null): Date | null => {
  if (!dateString) return null;
  
  try {
    // Si es formato YYYY-MM-DD, construir fecha evitando timezone issues
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      // Verificar que la fecha sea válida
      if (isNaN(date.getTime())) {
        console.warn(`[dateUtils] Fecha inválida: ${dateString}`);
        return null;
      }
      
      return date;
    }
    
    // Para otros formatos ISO, usar constructor Date
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.warn(`[dateUtils] Fecha inválida: ${dateString}`);
      return null;
    }
    
    return date;
  } catch (error) {
    console.error(`[dateUtils] Error al parsear fecha "${dateString}":`, error);
    return null;
  }
};

/**
 * Convierte un Date object a string ISO (YYYY-MM-DD)
 * Útil para enviar al backend
 * 
 * @param date - Objeto Date
 * @returns String en formato YYYY-MM-DD o undefined
 */
export const formatDateToISO = (date: Date | undefined | null): string | undefined => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return undefined;
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Convierte una fecha que puede ser string o Date a Date
 * Útil para campos que pueden venir en ambos formatos
 * 
 * @param dateValue - Fecha como string o Date
 * @returns Date object o null
 */
export const toDateObject = (dateValue: Date | string | undefined | null): Date | null => {
  if (!dateValue) return null;
  
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue;
  }
  
  if (typeof dateValue === 'string') {
    return parseISODate(dateValue);
  }
  
  return null;
};

/**
 * Valida si una fecha string es válida
 * 
 * @param dateString - String de fecha
 * @returns true si es una fecha válida
 */
export const isValidDateString = (dateString: string | undefined | null): boolean => {
  if (!dateString) return false;
  const date = parseISODate(dateString);
  return date !== null && !isNaN(date.getTime());
};
