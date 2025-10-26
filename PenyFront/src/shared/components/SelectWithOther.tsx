import { useState } from "react";
import { Select, TextInput } from "@mantine/core";

interface SelectWithOtherProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  data: { value: string; label: string }[];
  error?: string;
  required?: boolean;
  otherLabel?: string;
  otherPlaceholder?: string;
}

export const SelectWithOther = ({
  label,
  placeholder,
  value,
  onChange,
  data,
  error,
  required,
  otherLabel = "Especifique",
  otherPlaceholder = "Ingrese el valor",
}: SelectWithOtherProps) => {
  const [customValue, setCustomValue] = useState("");

  return (
    <>
      <Select
        label={label}
        placeholder={placeholder}
        value={value === "Otro" ? "Otro" : value}
        onChange={(selected) => {
          onChange(selected ?? "");
          if (selected === "Otro") setCustomValue("");
        }}
        data={data}
        error={error}
        required={required}
      />
      {value === "Otro" && (
        <TextInput
          label={otherLabel}
          placeholder={otherPlaceholder}
          required={required}
          value={customValue}
          onChange={(e) => {
            setCustomValue(e.target.value);
            onChange(e.target.value);
          }}
          error={error}
        />
      )}
    </>
  );
};
