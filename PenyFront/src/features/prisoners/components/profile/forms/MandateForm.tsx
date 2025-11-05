import React, { useState } from 'react';
import { Stack, TextInput, Textarea, Button, Group, Select, Text, Box, Image } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import type { FileWithPath } from '@mantine/dropzone';
import { Upload, X, FileText } from 'lucide-react';
import type {
  Mandate,
  CreateMandatesData,
  UpdateMandateData,
} from '../../../../../shared/types/caseTypes';

interface MandateFormProps {
  mode: 'create' | 'edit';
  initialData?: Mandate;
  onSubmit: (data: CreateMandatesData | UpdateMandateData, file?: File) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  errors?: Record<string, string>;
}

const MANDATE_TYPE_OPTIONS = [
  { value: 'Detencion', label: 'Detención' },
  { value: 'Condena', label: 'Condena' },
  { value: 'Libertad', label: 'Libertad' },
  { value: 'Apelacion', label: 'Apelación' },
  { value: 'Traslado', label: 'Traslado' },
];

const MANDATE_STATUS_OPTIONS = [
  { value: 'Vigente', label: 'Vigente' },
  { value: 'Ejecutado', label: 'Ejecutado' },
  { value: 'Anulado', label: 'Anulado' },
];

/**
 * Formulario reutilizable para crear o editar mandatos judiciales
 * 
 * @param mode - Modo del formulario: 'create' o 'edit'
 * @param initialData - Datos iniciales para modo edición
 * @param onSubmit - Función async que maneja el envío del formulario
 * @param onCancel - Función que maneja la cancelación
 * @param isLoading - Estado de carga del formulario
 * @param errors - Objeto con errores de validación
 */
export const MandateForm: React.FC<MandateFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  errors = {},
}) => {
  const [formData, setFormData] = useState<CreateMandatesData>({
    type: initialData?.type || 'Detencion',
    issue_date: initialData?.issue_date 
      ? new Date(initialData.issue_date).toISOString().split('T')[0] 
      : '',
    description: initialData?.description || '',
    status: initialData?.status || 'Vigente',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleChange = (field: keyof CreateMandatesData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileDrop = (files: FileWithPath[]) => {
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file as File);

      // Crear preview para imágenes
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'create') {
      await onSubmit(formData, selectedFile || undefined);
    } else {
      // En modo edición, solo enviamos los campos modificados
      const updatedData: UpdateMandateData = {};
      if (formData.type !== initialData?.type) {
        updatedData.type = formData.type;
      }
      if (formData.issue_date !== initialData?.issue_date) {
        updatedData.issue_date = formData.issue_date;
      }
      if (formData.description !== initialData?.description) {
        updatedData.description = formData.description;
      }
      if (formData.status !== initialData?.status) {
        updatedData.status = formData.status;
      }
      
      await onSubmit(updatedData, selectedFile || undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <Select
          label="Tipo de Mandato"
          placeholder="Selecciona el tipo"
          value={formData.type}
          onChange={(value) => handleChange('type', value || 'Detencion')}
          data={MANDATE_TYPE_OPTIONS}
          error={errors.type}
          required
          disabled={isLoading}
        />

        <TextInput
          label="Fecha de Emisión"
          type="date"
          value={formData.issue_date}
          onChange={(e) => handleChange('issue_date', e.currentTarget.value)}
          error={errors.issue_date}
          required
          disabled={isLoading}
        />

        <Select
          label="Estado del Mandato"
          placeholder="Selecciona el estado"
          value={formData.status}
          onChange={(value) => handleChange('status', value || 'Vigente')}
          data={MANDATE_STATUS_OPTIONS}
          error={errors.status}
          required
          disabled={isLoading}
        />

        <Textarea
          label="Descripción  "
          placeholder="Detalles del mandato judicial..."
          value={formData.description}
          onChange={(e) => handleChange('description', e.currentTarget.value)}
          error={errors.description}
          minRows={3}
          disabled={isLoading}
        />

        {/* Archivo actual en modo edición */}
        {mode === 'edit' && initialData?.file?.url && (
          <Box>
            <Text size="sm" fw={500} mb="xs">
              Archivo Actual
            </Text>
            {initialData.file.url.match(/\.(jpg|jpeg|png)$/i) ? (
              <Image
                src={initialData.file.url}
                alt="Archivo del mandato actual"
                width={120}
                height={120}
                radius="md"
                fit="cover"
              />
            ) : (
              <Box
                p="md"
                style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <FileText size={20} />
                <Text size="sm">PDF Adjunto</Text>
              </Box>
            )}
          </Box>
        )}

        {/* Dropzone para subir nuevo archivo */}
        <Box>
          <Text size="sm" fw={500} mb="xs">
            {mode === 'edit' ? 'Actualizar Archivo (Opcional)' : 'Subir Archivo (Opcional)'}
          </Text>
          
          {selectedFile ? (
            <Box
              p="md"
              style={{
                border: '2px solid #228be6',
                borderRadius: '8px',
                backgroundColor: '#f0f7ff',
              }}
            >
              <Group justify="space-between" mb="xs">
                <Group gap="xs">
                  {filePreview ? (
                    <Image
                      src={filePreview}
                      alt="Vista previa"
                      width={60}
                      height={60}
                      radius="md"
                      fit="cover"
                    />
                  ) : (
                    <FileText size={40} color="#228be6" />
                  )}
                  <div>
                    <Text size="sm" fw={500}>
                      {selectedFile.name}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  </div>
                </Group>
                <Button
                  variant="subtle"
                  color="red"
                  size="xs"
                  onClick={clearFile}
                  disabled={isLoading}
                >
                  <X size={16} />
                </Button>
              </Group>
            </Box>
          ) : (
            <Dropzone
              onDrop={handleFileDrop}
              accept={[...IMAGE_MIME_TYPE, 'application/pdf']}
              maxSize={5 * 1024 * 1024}
              disabled={isLoading}
            >
              <Group justify="center" gap="xs" style={{ minHeight: 120, pointerEvents: 'none' }}>
                <Dropzone.Accept>
                  <Upload size={40} color="var(--mantine-color-blue-6)" />
                </Dropzone.Accept>
                <Dropzone.Reject>
                  <X size={40} color="var(--mantine-color-red-6)" />
                </Dropzone.Reject>
                <Dropzone.Idle>
                  <Upload size={40} color="var(--mantine-color-dimmed)" />
                </Dropzone.Idle>

                <div>
                  <Text size="lg" inline>
                    Arrastra un archivo o haz click aquí
                  </Text>
                  <Text size="sm" c="dimmed" inline mt={7}>
                    Acepta imágenes y PDFs (máx. 5MB)
                  </Text>
                </div>
              </Group>
            </Dropzone>
          )}
        </Box>

        {errors.general && (
          <div style={{ color: 'var(--mantine-color-red-6)', fontSize: '14px' }}>
            {errors.general}
          </div>
        )}

        <Group justify="flex-end" mt="md">
          <Button
            variant="subtle"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isLoading}
          >
            {mode === 'create' ? 'Crear Mandato' : 'Guardar Cambios'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
