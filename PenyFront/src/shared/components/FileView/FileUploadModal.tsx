import React, { useState } from 'react';
import { Modal, Group, Button, Text, Stack } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import type { FileWithPath } from '@mantine/dropzone';
import { Upload, X, FileText } from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  label: string;
  acceptImages?: boolean;
  acceptPdf?: boolean;
}

export const FileUploadModal: React.FC<FileUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  isUploading,
  label,
  acceptImages = true,
  acceptPdf = true,
}) => {
  const [selectedFile, setSelectedFile] = useState<FileWithPath | null>(null);

  // Configurar tipos de archivo aceptados
  const acceptedTypes: string[] = [
    ...(acceptImages ? IMAGE_MIME_TYPE : []),
    ...(acceptPdf ? ['application/pdf'] : []),
  ];

  const handleDrop = (files: FileWithPath[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      // FileWithPath extends File, es compatible
      await onUpload(selectedFile as File);
      setSelectedFile(null);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  return (
    <Modal
      opened={isOpen}
      onClose={handleClose}
      title={`Actualizar ${label}`}
      centered
      size="md"
    >
      <Stack gap="md">
        <Dropzone
          onDrop={handleDrop}
          accept={acceptedTypes}
          maxSize={5 * 1024 * 1024} // 5MB
          multiple={false}
          loading={isUploading}
        >
          <Group justify="center" gap="xl" mih={120} style={{ pointerEvents: 'none' }}>
            <Dropzone.Accept>
              <Upload size={52} className="text-blue-500" />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <X size={52} className="text-red-500" />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <FileText size={52} className="text-gray-400" />
            </Dropzone.Idle>

            <div>
              <Text size="xl" inline>
                Arrastra el archivo aquí o haz click para seleccionar
              </Text>
              <Text size="sm" c="dimmed" inline mt={7}>
                {acceptImages && acceptPdf
                  ? 'Imágenes o archivos PDF, máximo 5MB'
                  : acceptImages
                    ? 'Solo imágenes, máximo 5MB'
                    : 'Solo archivos PDF, máximo 5MB'}
              </Text>
            </div>
          </Group>
        </Dropzone>

        {selectedFile && (
          <Group justify="space-between" p="sm" className="bg-blue-50 rounded-md">
            <Text size="sm" fw={500} className="truncate flex-1">
              {selectedFile.name}
            </Text>
            <Text size="xs" c="dimmed">
              {(selectedFile.size / 1024).toFixed(2)} KB
            </Text>
          </Group>
        )}

        <Group justify="flex-end" mt="md">
          <Button
            variant="subtle"
            color="gray"
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            disabled={!selectedFile}
            loading={isUploading}
          >
            Actualizar Archivo
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
