import { Textarea } from "@mantine/core";

interface TextareaFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  minRows?: number;
}

export const TextareaField = ({
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
  minRows = 2,
}: TextareaFieldProps) => (
  <Textarea
    label={label}
    value={value}
    onChange={onChange}
    error={error}
    required={required}
    placeholder={placeholder}
    autosize
    minRows={minRows}
  />
);
