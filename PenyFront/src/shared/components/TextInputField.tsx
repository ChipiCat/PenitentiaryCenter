import React, { useState, useCallback, useEffect, useRef } from "react";
import { TextInput } from "@mantine/core";

interface TextInputFieldProps {
  label: string;
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  min?: number;
  description?: string;
  debounce?: boolean; // Nueva prop para habilitar debounce
  debounceMs?: number; // Tiempo de debounce en ms
}

export const TextInputField = ({
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
  type = "text",
  min,
  description,
  debounce = false,
  debounceMs = 300,
}: TextInputFieldProps) => {
  const [localValue, setLocalValue] = useState(value || "");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDebouncing = debounce;

  // Sincronizar cuando el valor externo cambia
  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (!isDebouncing) {
      // Sin debounce: actualizar inmediatamente
      onChange(e);
      return;
    }

    // Con debounce: actualizar local inmediatamente, padre después
    setLocalValue(newValue);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      onChange(e);
    }, debounceMs);
  }, [onChange, isDebouncing, debounceMs]);

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <TextInput
      label={label}
      value={isDebouncing ? localValue : value}
      onChange={handleChange}
      error={error}
      required={required}
      placeholder={placeholder}
      type={type}
      min={min}
      description={description}
    />
  );
};