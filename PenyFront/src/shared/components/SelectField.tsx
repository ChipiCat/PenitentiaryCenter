import { Select } from "@mantine/core";

interface SelectFieldProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string | null) => void;
  data: { value: string; label: string }[];
  error?: string;
  required?: boolean;
}

export const SelectField = ({
  label,
  placeholder,
  value,
  onChange,
  data,
  error,
  required,
}: SelectFieldProps) => (
  <Select
    label={label}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    data={data}
    error={error}
    required={required}
  />
);
