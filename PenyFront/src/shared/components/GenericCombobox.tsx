import { Combobox, TextInput, useCombobox } from "@mantine/core";
import { useState, useEffect, useRef, useCallback } from "react";
import type { ChangeEvent } from "react";

interface GenericComboboxProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  error?: string;
  required?: boolean;
  debounce?: boolean;
  debounceMs?: number;
}

export const GenericCombobox = ({
  label,
  placeholder,
  value,
  onChange,
  options,
  error,
  required,
  debounce = false,
  debounceMs = 300,
}: GenericComboboxProps) => {
  const combobox = useCombobox();
  const [localValue, setLocalValue] = useState(value);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const filteredOptions = options.filter((item) =>
    item.toLowerCase().includes((localValue || "").toLowerCase().trim())
  );

  const handleChange = useCallback((newValue: string) => {
    setLocalValue(newValue);
    
    if (!debounce) {
      onChange(newValue);
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      onChange(newValue);
    }, debounceMs);
  }, [onChange, debounce, debounceMs]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <Combobox
      onOptionSubmit={(optionValue) => {
        setLocalValue(optionValue);
        onChange(optionValue);
        combobox.closeDropdown();
      }}
      store={combobox}
    >
      <Combobox.Target>
        <TextInput
          label={label}
          placeholder={placeholder}
          required={required}
          value={localValue}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            handleChange(event.currentTarget.value);
            combobox.openDropdown();
            combobox.updateSelectedOptionIndex();
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
          error={error}
        />
      </Combobox.Target>
      <Combobox.Dropdown>
        <Combobox.Options>
          {filteredOptions.length === 0 ? (
            <Combobox.Empty>No se encontró</Combobox.Empty>
          ) : (
            filteredOptions.map((item) => (
              <Combobox.Option value={item} key={item}>
                {item}
              </Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};