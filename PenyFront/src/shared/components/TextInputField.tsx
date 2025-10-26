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
}: TextInputFieldProps) => (
  <TextInput
    label={label}
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    placeholder={placeholder}
    type={type}
    min={min}
    description={description}
  />
);