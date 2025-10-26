import { Card, Stack, Group, TextInput, Button, ActionIcon, Title, Text } from '@mantine/core';
import { Plus, Trash2 } from 'lucide-react';

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
}: DynamicListFormProps<T>) {
  return (
    <Card withBorder padding="lg">
      <Title order={4} size="h5" mb="md">{title}</Title>
      <Stack gap="md">
        {items.map((item, index) => (
          <Card key={index} withBorder padding="md">
            <Group justify="space-between" mb="sm">
              <Text size="sm" fw={500}>
                {title} {index + 1}
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
              {fields.map((field) => (
                <TextInput
                  key={field.key}
                  label={field.label}
                  placeholder={field.placeholder}
                  value={(item as any)[field.key] || ''}
                  onChange={(e) => onChange(index, field.key, e.target.value)}
                  required={field.required}
                  type={field.type || 'text'}
                  error={errors[`${title.toLowerCase()}.${index}.${field.key}`]}
                />
              ))}
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