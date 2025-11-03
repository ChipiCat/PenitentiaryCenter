import React from 'react';
import { Modal, Group, ActionIcon, Text, Image } from '@mantine/core';
import { X, Edit3 } from 'lucide-react';
import type { FileInfo } from '../../types/filesTypes';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  fileInfo: FileInfo;
  label: string;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  onEdit,
  fileInfo,
  label,
}) => {
  const isImage = fileInfo.mimeType?.startsWith('image/');
  const isPdf = fileInfo.mimeType === 'application/pdf';

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <Group justify="space-between" className="w-full">
          <Text fw={600} size="lg">
            {label}
          </Text>
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              aria-label="Editar archivo"
            >
              <Edit3 size={18} />
            </ActionIcon>
          </Group>
        </Group>
      }
      centered
      closeButtonProps={{
        icon: <X size={20} />,
      }}
    >
      <div className="w-full">
        {isImage ? (
          <Image
            src={fileInfo.url}
            alt={label}
            fit="contain"
            className="w-full max-h-[70vh] object-contain"
          />
        ) : isPdf ? (
          <iframe
            src={fileInfo.url}
            title={label}
            className="w-full h-[70vh] border-0 rounded-md"
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <Text c="dimmed">
              No se puede previsualizar este tipo de archivo
            </Text>
          </div>
        )}
      </div>
    </Modal>
  );
};
