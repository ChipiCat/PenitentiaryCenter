import React, { useState, useCallback, useEffect } from 'react';
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
 * y sincroniza con el padre solo cuando es necesario
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

  // Sincronizar cuando el valor externo cambia (ej: cargar datos)
  useEffect(() => {
    setLocalValue(externalValue);
  }, [externalValue]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    externalOnChange(newValue);
  }, [externalOnChange]);

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
