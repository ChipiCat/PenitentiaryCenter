import React, { useState } from 'react';
import { Stack, TextInput, Textarea, Button, Group, Text, Box, Image } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import type { FileWithPath } from '@mantine/dropzone';
import { Upload, X, FileText } from 'lucide-react';
import type {
  MedicalRecord,
  CreateMedicalRecordData,
  UpdateMedicalRecordData,
} from '../../../../../shared/types/medicalRecordTypes';

interface MedicalRecordFormProps {
  mode: 'create' | 'edit';
  initialData?: MedicalRecord;
  onSubmit: (data: CreateMedicalRecordData | UpdateMedicalRecordData, file?: File) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  errors?: Record<string, string>;
}

/**
 * Formulario reutilizable para crear o editar registros médicos
 * 
 * @param mode - Modo del formulario: 'create' o 'edit'
 * @param initialData - Datos iniciales para modo edición
 * @param onSubmit - Función async que maneja el envío del formulario
 * @param onCancel - Función que maneja la cancelación
 * @param isLoading - Estado de carga del formulario
 * @param errors - Objeto con errores de validación
 */
export const MedicalRecordForm: React.FC<MedicalRecordFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  errors = {},
}) => {
  const [formData, setFormData] = useState<CreateMedicalRecordData>({
    doctor_name: initialData?.doctor_name || '',
    examination_date: initialData?.examination_date 
      ? new Date(initialData.examination_date).toISOString().split('T')[0] 
      : '',
    reference_number: initialData?.reference_number || '',
    notes: initialData?.notes || '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleChange = (field: keyof CreateMedicalRecordData, value: string) => {
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
      const updatedData: UpdateMedicalRecordData = {};
      if (formData.doctor_name !== initialData?.doctor_name) {
        updatedData.doctor_name = formData.doctor_name;
      }
      if (formData.examination_date !== initialData?.examination_date) {
        updatedData.examination_date = formData.examination_date;
      }
      if (formData.reference_number !== initialData?.reference_number) {
        updatedData.reference_number = formData.reference_number;
      }
      if (formData.notes !== initialData?.notes) {
        updatedData.notes = formData.notes;
      }
      
      await onSubmit(updatedData, selectedFile || undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="Nombre del Doctor"
          placeholder="Dr. Juan Pérez"
          value={formData.doctor_name}
          onChange={(e) => handleChange('doctor_name', e.currentTarget.value)}
          error={errors.doctor_name}
          required
          disabled={isLoading}
        />

        <TextInput
          label="Fecha del Examen"
          type="date"
          value={formData.examination_date}
          onChange={(e) => handleChange('examination_date', e.currentTarget.value)}
          error={errors.examination_date}
          required
          disabled={isLoading}
        />

        <TextInput
          label="Referencia/Ubicación"
          placeholder="Hospital Central - Sala 3"
          value={formData.reference_number}
          onChange={(e) => handleChange('reference_number', e.currentTarget.value)}
          error={errors.reference_number}
          disabled={isLoading}
        />

        <Textarea
          label="Notas"
          placeholder="Observaciones del examen médico..."
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.currentTarget.value)}
          error={errors.notes}
          minRows={3}
          disabled={isLoading}
        />

        {/* Archivo actual en modo edición */}
        {mode === 'edit' && initialData?.file && (
          <Box>
            <Text size="sm" fw={500} mb="xs">
              Archivo Actual
            </Text>
            {initialData.file.mimeType.startsWith('image/') ? (
              <Image
                src={initialData.file.url}
                alt="Archivo médico actual"
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
            {mode === 'create' ? 'Crear Registro' : 'Guardar Cambios'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
