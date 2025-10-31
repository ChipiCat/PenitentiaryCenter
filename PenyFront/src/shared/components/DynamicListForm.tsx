import { Card, Stack, Group, Button, ActionIcon, Title, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { Plus, Trash2 } from 'lucide-react';
import { TextInputField } from './TextInputField';
import { parseISODate, formatDateToISO } from '../../features/prisoners/components/forms/utils/dateUtils';

interface FieldConfig {
  label: string;
  placeholder: string;
  key: string;
  required?: boolean;
  type?: string;
}

interface DynamicListFormProps<T> {
  title: string;
  items: T[];
  fields: FieldConfig[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: string, value: string) => void;
  errors?: Record<string, string>;
  addLabel?: string;
  getSubtitle?: string;
}

export function DynamicListForm<T>({
  title,
  items,
  fields,
  onAdd,
  onRemove,
  onChange,
  errors = {},
  addLabel = 'Agregar',
  getSubtitle,
}: DynamicListFormProps<T>) {
  return (
    <Card withBorder padding="lg">
      <Title order={4} size="h5" mb="md">{title}</Title>
      <Stack gap="md">
        {items.map((item, index) => (
          <Card key={index} withBorder padding="md">
            <Group justify="space-between" mb="sm">
              <Text size="sm" fw={500}>
                {getSubtitle} {index + 1}
              </Text>
              <ActionIcon
                color="red"
                variant="light"
                size="sm"
                onClick={() => onRemove(index)}
              >
                <Trash2 size={14} />
              </ActionIcon>
            </Group>
            <Stack gap="sm">
              {fields.map((field) => {
                const value = item[field.key as keyof T];
                const errorKey = `child.${index}.${field.key}`;
                
                // Renderizar DatePickerInput para campos de tipo "date"
                if (field.type === 'date') {
                  return (
                    <DatePickerInput
                      key={field.key}
                      label={field.label}
                      placeholder={field.placeholder}
                      value={parseISODate(String(value ?? ''))}
                      onChange={(dateValue: Date | string | null) => {
                        let dateString = '';
                        if (dateValue instanceof Date) {
                          dateString = formatDateToISO(dateValue) ?? '';
                        } else if (typeof dateValue === 'string') {
                          dateString = dateValue;
                        }
                        onChange(index, field.key, dateString);
                      }}
                      required={field.required}
                      error={errors[errorKey]}
                      maxDate={new Date()}
                    />
                  );
                }
                
                // Renderizar TextInputField para otros tipos
                return (
                  <TextInputField
                    key={field.key}
                    label={field.label}
                    placeholder={field.placeholder}
                    value={String(value ?? '')}
                    onChange={(e) => onChange(index, field.key, e.target.value)}
                    required={field.required}
                    type={field.type || 'text'}
                    error={errors[errorKey]}
                    debounce={true}
                  />
                );
              })}
            </Stack>
          </Card>
        ))}
        <Button leftSection={<Plus size={16} />} onClick={onAdd} variant="light">
          {addLabel}
        </Button>
      </Stack>
    </Card>
  );
}