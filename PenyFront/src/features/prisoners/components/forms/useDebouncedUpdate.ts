import { useCallback, useRef } from 'react';

/**
 * Hook para debounce de actualizaciones de formulario
 * Optimiza el rendimiento al agrupar múltiples cambios
 */
export function useDebouncedUpdate<T>(
  onUpdate: (updates: T) => void,
  delay: number = 0
) {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const pendingUpdatesRef = useRef<Partial<T>>({});

  const debouncedUpdate = useCallback((updates: Partial<T>) => {
    // Acumular actualizaciones
    pendingUpdatesRef.current = {
      ...pendingUpdatesRef.current,
      ...updates
    };

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Si no hay delay, actualizar inmediatamente (más rápido para inputs)
    if (delay === 0) {
      onUpdate(pendingUpdatesRef.current as T);
      pendingUpdatesRef.current = {};
      return;
    }

    // Programar actualización con delay
    timeoutRef.current = setTimeout(() => {
      onUpdate(pendingUpdatesRef.current as T);
      pendingUpdatesRef.current = {};
    }, delay);
  }, [onUpdate, delay]);

  return debouncedUpdate;
}
