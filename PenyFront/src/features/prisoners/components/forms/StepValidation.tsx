import { Alert, List } from '@mantine/core';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ValidationError {
  field: string;
  message: string;
}

interface StepValidationProps {
  errors: ValidationError[];
  warnings: string[];
  isValid: boolean;
}

export const StepValidation = ({ errors, warnings, isValid }: StepValidationProps) => {
  if (errors.length === 0 && warnings.length === 0) return null;

  return (
    <>
      {errors.length > 0 && (
        <Alert
          icon={<AlertCircle size={16} />}
          title="Campos requeridos"
          color="red"
          variant="light"
          mb="md"
        >
          <List size="sm" spacing="xs">
            {errors.map((error, index) => (
              <List.Item key={index}>
                {error.message}
              </List.Item>
            ))}
          </List>
        </Alert>
      )}

      {warnings.length > 0 && (
        <Alert
          icon={<Info size={16} />}
          title="Recomendaciones"
          color="yellow"
          variant="light"
          mb="md"
        >
          <List size="sm" spacing="xs">
            {warnings.map((warning, index) => (
              <List.Item key={index}>
                {warning}
              </List.Item>
            ))}
          </List>
        </Alert>
      )}

      {isValid && errors.length === 0 && (
        <Alert
          icon={<CheckCircle size={16} />}
          title="Información completa"
          color="green"
          variant="light"
          mb="md"
        >
          Todos los campos obligatorios han sido completados correctamente.
        </Alert>
      )}
    </>
  );
};