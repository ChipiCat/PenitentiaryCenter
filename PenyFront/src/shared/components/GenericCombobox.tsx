import { Combobox, TextInput, useCombobox } from "@mantine/core";
import type { ChangeEvent } from "react";

interface GenericComboboxProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  error?: string;
  required?: boolean;
}

export const GenericCombobox = ({
  label,
  placeholder,
  value,
  onChange,
  options,
  error,
  required,
}: GenericComboboxProps) => {
  const combobox = useCombobox();
  const filteredOptions = options.filter((item) =>
    item.toLowerCase().includes(value.toLowerCase().trim())
  );

  return (
    <Combobox
      onOptionSubmit={(optionValue) => {
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
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            onChange(event.currentTarget.value);
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