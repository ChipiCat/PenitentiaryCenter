import { 
  Stack, 
  Grid,
  Title,
  Text,
  FileInput,
  Group,
  Badge,
  Paper,
  Button,
  Alert
} from '@mantine/core';
import { Upload, FileText, Camera, AlertCircle, X } from 'lucide-react';
import type { FormStepProps, Documents } from '../../types';

export const DocumentsStep = ({ data, onUpdate }: FormStepProps<Documents>) => {
  const handleSingleFileChange = (
    field: keyof Pick<Documents, 'photo' | 'identificationDoc' | 'medicalRecord'>, 
    file: File | null
  ) => {
    onUpdate({ [field]: file });
  };

  const handleMultipleFilesChange = (files: File[]) => {
    onUpdate({ legalDocuments: files });
  };

  const removeFile = (field: keyof Pick<Documents, 'photo' | 'identificationDoc' | 'medicalRecord'>) => {
    onUpdate({ [field]: null });
  };

  const removeLegalDocument = (index: number) => {
    const newFiles = data.legalDocuments.filter((_, i) => i !== index);
    onUpdate({ legalDocuments: newFiles });
  };

  return (
    <Stack gap="md">
      <Title order={3} size="h4" mb="md">
        Documentos y Archivos
      </Title>

      <Alert 
        icon={<AlertCircle size={16} />} 
        title="Información sobre documentos"
        color="blue"
        mb="md"
      >
        Todos los documentos son opcionales, pero se recomienda subir al menos la foto y 
        documento de identificación para un mejor control del interno.
      </Alert>

      <Grid>
        {/* Foto del interno */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <Camera size={16} />
                <Text fw={500}>Fotografía del Interno</Text>
              </Group>
              {data.photo && (
                <Button
                  size="xs"
                  variant="subtle"
                  color="red"
                  onClick={() => removeFile('photo')}
                >
                  <X size={12} />
                </Button>
              )}
            </Group>
            
            <FileInput
              placeholder="Seleccionar fotografía"
              accept="image/*"
              value={data.photo}
              onChange={(file) => handleSingleFileChange('photo', file)}
            />
            
            {data.photo && (
              <Badge color="green" size="sm" mt="xs">
                {data.photo.name}
              </Badge>
            )}
          </Paper>
        </Grid.Col>

        {/* Documento de identificación */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <FileText size={16} />
                <Text fw={500}>Documento de Identificación</Text>
              </Group>
              {data.identificationDoc && (
                <Button
                  size="xs"
                  variant="subtle"
                  color="red"
                  onClick={() => removeFile('identificationDoc')}
                >
                  <X size={12} />
                </Button>
              )}
            </Group>
            
            <FileInput
              placeholder="Cédula, pasaporte, etc."
              accept=".pdf,.jpg,.jpeg,.png"
              value={data.identificationDoc}
              onChange={(file) => handleSingleFileChange('identificationDoc', file)}
            />
            
            {data.identificationDoc && (
              <Badge color="blue" size="sm" mt="xs">
                {data.identificationDoc.name}
              </Badge>
            )}
          </Paper>
        </Grid.Col>

        {/* Expediente médico */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" withBorder>
            <Group justify="space-between" mb="xs">
              <Group gap="xs">
                <FileText size={16} />
                <Text fw={500}>Expediente Médico</Text>
              </Group>
              {data.medicalRecord && (
                <Button
                  size="xs"
                  variant="subtle"
                  color="red"
                  onClick={() => removeFile('medicalRecord')}
                >
                  <X size={12} />
                </Button>
              )}
            </Group>
            
            <FileInput
              placeholder="Historial médico"
              accept=".pdf,.doc,.docx"
              value={data.medicalRecord}
              onChange={(file) => handleSingleFileChange('medicalRecord', file)}
            />
            
            {data.medicalRecord && (
              <Badge color="orange" size="sm" mt="xs">
                {data.medicalRecord.name}
              </Badge>
            )}
          </Paper>
        </Grid.Col>

        {/* Documentos legales */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" withBorder>
            <Group gap="xs" mb="xs">
              <Upload size={16} />
              <Text fw={500}>Documentos Legales</Text>
            </Group>
            
            <FileInput
              placeholder="Sentencias, órdenes judiciales, etc."
              accept=".pdf,.doc,.docx"
              multiple
              value={data.legalDocuments}
              onChange={handleMultipleFilesChange}
            />
            
            {data.legalDocuments.length > 0 && (
              <Stack gap="xs" mt="md">
                <Text size="sm" fw={500}>
                  Archivos seleccionados ({data.legalDocuments.length}):
                </Text>
                {data.legalDocuments.map((file, index) => (
                  <Group key={index} justify="space-between">
                    <Badge color="purple" size="sm">
                      {file.name}
                    </Badge>
                    <Button
                      size="xs"
                      variant="subtle"
                      color="red"
                      onClick={() => removeLegalDocument(index)}
                    >
                      <X size={12} />
                    </Button>
                  </Group>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Información adicional */}
      <Paper p="md" withBorder bg="gray.0">
        <Text size="sm" c="dimmed">
          <strong>Formatos aceptados:</strong>
          <br />
          • Imágenes: JPG, PNG (para fotografías)
          <br />
          • Documentos: PDF, DOC, DOCX
          <br />
          • Tamaño máximo por archivo: 10MB
        </Text>
      </Paper>
    </Stack>
  );
};