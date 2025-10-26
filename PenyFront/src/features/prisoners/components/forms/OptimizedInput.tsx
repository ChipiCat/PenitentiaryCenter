import React, { useState, useCallback, useEffect, useRef } from 'react';
import { TextInputField } from '../../../../shared/components/TextInputField';

interface OptimizedTextInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

/**
 * Input optimizado que mantiene su propio estado local
 * y sincroniza con el padre usando debounce para mejor rendimiento
 */
export const OptimizedTextInput = React.memo<OptimizedTextInputProps>(({
  label,
  placeholder,
  value: externalValue,
  onChange: externalOnChange,
  error,
  required,
}) => {
  const [localValue, setLocalValue] = useState(externalValue);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sincronizar cuando el valor externo cambia (ej: cargar datos)
  useEffect(() => {
    setLocalValue(externalValue);
  }, [externalValue]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Limpiar el timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Solo actualizar el padre después de 300ms sin escribir
    debounceTimerRef.current = setTimeout(() => {
      externalOnChange(newValue);
    }, 300);
  }, [externalOnChange]);

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <TextInputField
      label={label}
      placeholder={placeholder}
      value={localValue}
      onChange={handleChange}
      error={error}
      required={required}
    />
  );
});

OptimizedTextInput.displayName = 'OptimizedTextInput';
