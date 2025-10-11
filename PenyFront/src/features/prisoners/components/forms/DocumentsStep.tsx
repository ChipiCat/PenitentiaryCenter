import { useState, useCallback } from 'react';
import {
  Stack,
  Group,
  Text,
  Card,
  ThemeIcon,
  Alert,
  Progress,
  ActionIcon,
  Grid,
  Title,
  Badge,
  Image,
  FileInput
} from '@mantine/core';
import {
  Upload,
  File,
  X,
  Camera,
  FileText,
  Heart,
  Scale,
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react';

// 🔧 Imports condicionales para Dropzone
let Dropzone: any;
let IMAGE_MIME_TYPE: string[];
let PDF_MIME_TYPE: string[];
let MS_WORD_MIME_TYPE: string[];

try {
  const dropzoneModule = require('@mantine/dropzone');
  Dropzone = dropzoneModule.Dropzone;
  IMAGE_MIME_TYPE = dropzoneModule.IMAGE_MIME_TYPE;
  PDF_MIME_TYPE = dropzoneModule.PDF_MIME_TYPE;
  MS_WORD_MIME_TYPE = dropzoneModule.MS_WORD_MIME_TYPE;
} catch (error) {
  // Fallback si @mantine/dropzone no está disponible
  console.warn('@mantine/dropzone no está instalado, usando FileInput como fallback');
  IMAGE_MIME_TYPE = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
  PDF_MIME_TYPE = ['application/pdf'];
  MS_WORD_MIME_TYPE = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
}

// Importar tipos específicos
import type { FormStepProps, Documents, DocumentType } from '../../types';

// Type para FileWithPath alternativo
type FileWithPath = File & { path?: string };

// 🔧 Tipo más flexible para configuración de documentos
interface DocumentConfig {
  type: DocumentType;
  label: string;
  description: string;
  accept: string;
  maxSize: number;
  maxFiles: number;
  required: boolean;
}

const DOCUMENT_CONFIGS: DocumentConfig[] = [
  {
    type: 'photo',
    label: 'Fotografía del Recluso',
    description: 'Foto reciente y clara del rostro',
    accept: IMAGE_MIME_TYPE.join(','),
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
    required: true
  },
  {
    type: 'identificationDoc',
    label: 'Documento de Identificación',
    description: 'Cédula de identidad o pasaporte',
    accept: [...IMAGE_MIME_TYPE, ...PDF_MIME_TYPE].join(','),
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
    required: true
  },
  {
    type: 'medicalRecord',
    label: 'Registro Médico Principal',
    description: 'Examen médico de ingreso',
    accept: [...PDF_MIME_TYPE, ...MS_WORD_MIME_TYPE].join(','),
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1,
    required: false
  }
];

export const DocumentsStep = ({ data, onUpdate }: FormStepProps<Documents>) => {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // Función tipada para manejar la subida de archivos
  const handleFileUpload = useCallback(async (files: FileWithPath[], type: DocumentType) => {
    if (files.length === 0) return;

    const file = files[0];
    const config = DOCUMENT_CONFIGS.find(c => c.type === type);
    
    if (!config && type !== 'legalDocuments') return;

    // Obtener límite de tamaño según el tipo
    const maxSize = config ? config.maxSize : 10 * 1024 * 1024; // 10MB para documentos legales

    // Validaciones
    if (file.size > maxSize) {
      onUpdate({
        [`${type}Error`]: `El archivo es muy grande. Máximo ${maxSize / 1024 / 1024}MB`
      } as Partial<Documents>);
      return;
    }

    // Simular progreso de subida
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const currentProgress = prev[type] || 0;
        if (currentProgress >= 100) {
          clearInterval(interval);
          return prev;
        }
        return { ...prev, [type]: currentProgress + 10 };
      });
    }, 100);

    // Actualizar el documento
    setTimeout(() => {
      if (type === 'legalDocuments') {
        // Para legalDocuments, agregar al array existente
        const existingDocs = data.legalDocuments || [];
        onUpdate({
          legalDocuments: [...existingDocs, file]
        });
      } else {
        // Para documentos individuales
        onUpdate({
          [type]: file
        } as Partial<Documents>);
      }

      setUploadProgress(prev => ({ ...prev, [type]: 100 }));
    }, 1200);
  }, [data.legalDocuments, onUpdate]);

  // Función tipada para remover archivos
  const handleFileRemove = useCallback((type: DocumentType, index?: number) => {
    if (type === 'legalDocuments' && typeof index === 'number') {
      const existingDocs = data.legalDocuments || [];
      const newDocs = existingDocs.filter((_file: File, i: number) => i !== index);
      onUpdate({
        legalDocuments: newDocs
      });
    } else {
      onUpdate({
        [type]: undefined
      } as Partial<Documents>);
    }
  }, [data.legalDocuments, onUpdate]);

  const getFilePreview = useCallback((file: File) => {
    return URL.createObjectURL(file);
  }, []);

  const getFileIcon = useCallback((type: DocumentType) => {
    switch (type) {
      case 'photo':
        return <Camera size={16} />;
      case 'identificationDoc':
        return <FileText size={16} />;
      case 'medicalRecord':
        return <Heart size={16} />;
      case 'legalDocuments':
        return <Scale size={16} />;
      default:
        return <File size={16} />;
    }
  }, []);

  // 🔧 Componente de upload con fallback - tipo más flexible
  const UploadZone = ({ config, onDrop }: { 
    config: DocumentConfig, 
    onDrop: (files: FileWithPath[]) => void 
  }) => {
    if (Dropzone) {
      return (
        <Dropzone
          onDrop={onDrop}
          accept={config.accept.split(',')}
          maxSize={config.maxSize}
          maxFiles={config.maxFiles}
        >
          <Group justify="center" gap="xl" mih={100} style={{ pointerEvents: 'none' }}>
            <div style={{ textAlign: 'center' }}>
              <Upload size={50} style={{ margin: '0 auto 8px' }} />
              <Text size="lg">
                Arrastra el archivo aquí o haz clic para seleccionar
              </Text>
              <Text size="sm" c="dimmed" mt="xs">
                Máximo {(config.maxSize / 1024 / 1024).toFixed(0)}MB
              </Text>
            </div>
          </Group>
        </Dropzone>
      );
    }

    // Fallback usando FileInput
    return (
      <Card withBorder p="lg" style={{ minHeight: 100, border: '2px dashed var(--mantine-color-gray-4)' }}>
        <Stack gap="md" align="center">
          <Upload size={50} />
          <FileInput
            placeholder="Seleccionar archivo"
            accept={config.accept}
            onChange={(file) => {
              if (file) {
                onDrop([file as FileWithPath]);
              }
            }}
          />
          <Text size="sm" c="dimmed" ta="center">
            {config.description}
            <br />
            Máximo {(config.maxSize / 1024 / 1024).toFixed(0)}MB
          </Text>
        </Stack>
      </Card>
    );
  };

  const renderSingleFileUpload = (config: DocumentConfig) => {
    const file = data[config.type as keyof Documents] as File | undefined;
    const progress = uploadProgress[config.type];
    const isUploading = progress !== undefined && progress < 100;

    return (
      <Card key={config.type} withBorder padding="lg">
        <Group justify="space-between" mb="md">
          <Group gap="sm">
            <ThemeIcon size="sm" variant="light">
              {getFileIcon(config.type)}
            </ThemeIcon>
            <div>
              <Text fw={500} size="sm">{config.label}</Text>
              <Text size="xs" c="dimmed">{config.description}</Text>
            </div>
          </Group>
          {config.required && <Badge color="red" size="sm">Requerido</Badge>}
        </Group>

        {!file && !isUploading && (
          <UploadZone 
            config={config}
            onDrop={(files) => handleFileUpload(files, config.type)}
          />
        )}

        {isUploading && (
          <Stack gap="sm">
            <Text size="sm">Subiendo archivo...</Text>
            {/* 🔧 Cambiar animate por animated */}
            <Progress value={progress} striped animated />
          </Stack>
        )}

        {file && !isUploading && (
          <Group justify="space-between" p="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: 'var(--mantine-radius-sm)' }}>
            <Group gap="sm">
              {config.type === 'photo' && file.type.startsWith('image/') && (
                <Image
                  src={getFilePreview(file)}
                  alt="Preview"
                  width={40}
                  height={40}
                  style={{ borderRadius: 4 }}
                />
              )}
              <div>
                <Text size="sm" fw={500}>{file.name}</Text>
                <Text size="xs" c="dimmed">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </Text>
              </div>
            </Group>
            <Group gap="xs">
              {config.type === 'photo' && file.type.startsWith('image/') && (
                <ActionIcon variant="subtle" size="sm">
                  <Eye size={16} />
                </ActionIcon>
              )}
              <ActionIcon 
                variant="subtle" 
                color="red" 
                size="sm"
                onClick={() => handleFileRemove(config.type)}
              >
                <X size={16} />
              </ActionIcon>
            </Group>
          </Group>
        )}
      </Card>
    );
  };

  // Documentos legales (múltiples archivos)
  const renderLegalDocuments = () => {
    const files = data.legalDocuments || [];
    const progress = uploadProgress.legalDocuments;
    const isUploading = progress !== undefined && progress < 100;

    // 🔧 Crear configuración específica para documentos legales
    const legalConfig: DocumentConfig = {
      type: 'legalDocuments',
      label: 'Documentos Legales',
      description: 'Sentencias, actas, documentos del proceso legal',
      accept: [...PDF_MIME_TYPE, ...MS_WORD_MIME_TYPE].join(','),
      maxSize: 10 * 1024 * 1024,
      maxFiles: 10,
      required: false
    };

    return (
      <Card withBorder padding="lg">
        <Group justify="space-between" mb="md">
          <Group gap="sm">
            <ThemeIcon size="sm" variant="light">
              <Scale size={16} />
            </ThemeIcon>
            <div>
              <Text fw={500} size="sm">Documentos Legales</Text>
              <Text size="xs" c="dimmed">Sentencias, actas, documentos del proceso legal</Text>
            </div>
          </Group>
          <Badge color="blue" size="sm">Opcional</Badge>
        </Group>

        {!isUploading && (
          <UploadZone 
            config={legalConfig}
            onDrop={(files) => handleFileUpload(files, 'legalDocuments')}
          />
        )}

        {isUploading && (
          <Stack gap="sm">
            <Text size="sm">Subiendo documentos...</Text>
            {/* 🔧 Cambiar animate por animated */}
            <Progress value={progress} striped animated />
          </Stack>
        )}

        {files.length > 0 && (
          <Stack gap="xs" mt="md">
            {files.map((file: File, index: number) => (
              <Group key={index} justify="space-between" p="sm" style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: 'var(--mantine-radius-sm)' }}>
                <Group gap="sm">
                  <ThemeIcon size="sm" variant="light">
                    <FileText size={14} />
                  </ThemeIcon>
                  <div>
                    <Text size="sm" fw={500}>{file.name}</Text>
                    <Text size="xs" c="dimmed">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </Text>
                  </div>
                </Group>
                <ActionIcon 
                  variant="subtle" 
                  color="red" 
                  size="sm"
                  onClick={() => handleFileRemove('legalDocuments', index)}
                >
                  <X size={16} />
                </ActionIcon>
              </Group>
            ))}
          </Stack>
        )}
      </Card>
    );
  };

  const validateStep = () => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar documentos requeridos
    DOCUMENT_CONFIGS.forEach(config => {
      if (config.required && !data[config.type as keyof Documents]) {
        errors.push(`${config.label} es requerido`);
      }
    });

    // Warnings para documentos opcionales
    if (!data.medicalRecord) {
      warnings.push('Se recomienda subir el registro médico de ingreso');
    }

    if (!data.legalDocuments?.length) {
      warnings.push('Se recomienda subir documentos legales del proceso');
    }

    return { errors, warnings, isValid: errors.length === 0 };
  };

  const { errors, warnings, isValid } = validateStep();

  return (
    <Stack gap="lg">
      <Group gap="md" mb="md">
        <ThemeIcon size="lg" variant="light" color="blue">
          <FileText size={20} />
        </ThemeIcon>
        <div>
          <Title order={3} size="h4">
            Documentos y Archivos
          </Title>
          <Text size="sm" c="dimmed">
            Suba los documentos necesarios para el expediente
          </Text>
        </div>
      </Group>

      {/* Errores */}
      {errors.length > 0 && (
        <Alert
          icon={<AlertCircle size={16} />}
          title="Documentos requeridos faltantes"
          color="red"
          variant="light"
        >
          <Stack gap="xs">
            {errors.map((error, index) => (
              <Text key={index} size="sm">• {error}</Text>
            ))}
          </Stack>
        </Alert>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Alert
          icon={<AlertCircle size={16} />}
          title="Recomendaciones"
          color="yellow"
          variant="light"
        >
          <Stack gap="xs">
            {warnings.map((warning, index) => (
              <Text key={index} size="sm">• {warning}</Text>
            ))}
          </Stack>
        </Alert>
      )}

      {/* Status si todo está bien */}
      {isValid && (
        <Alert
          icon={<CheckCircle size={16} />}
          title="Documentos listos"
          color="green"
          variant="light"
        >
          Todos los documentos requeridos han sido subidos correctamente.
        </Alert>
      )}

      {/* Documentos individuales */}
      <Grid>
        {DOCUMENT_CONFIGS.map(config => (
          <Grid.Col key={config.type} span={{ base: 12, md: 6 }}>
            {renderSingleFileUpload(config)}
          </Grid.Col>
        ))}
      </Grid>

      {/* Documentos legales */}
      {renderLegalDocuments()}
    </Stack>
  );
};