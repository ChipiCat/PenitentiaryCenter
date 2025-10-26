import React, { useState, useCallback, useEffect, useRef } from "react";
import { Textarea } from "@mantine/core";

interface TextareaFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  minRows?: number;
  debounce?: boolean;
  debounceMs?: number;
}

export const TextareaField = ({
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
  minRows = 2,
  debounce = false,
  debounceMs = 300,
}: TextareaFieldProps) => {
  const [localValue, setLocalValue] = useState(value || "");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isDebouncing = debounce;

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    if (!isDebouncing) {
      onChange(e);
      return;
    }

    setLocalValue(newValue);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      onChange(e);
    }, debounceMs);
  }, [onChange, isDebouncing, debounceMs]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <Textarea
      label={label}
      value={isDebouncing ? localValue : value}
      onChange={handleChange}
      error={error}
      required={required}
      placeholder={placeholder}
      autosize
      minRows={minRows}
    />
  );
};
