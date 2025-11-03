import React from 'react';
import { Card, Image, ActionIcon, Text } from '@mantine/core';
import { FileText, Eye } from 'lucide-react';
import type { FileInfo } from '../../types/filesTypes';

interface FileViewCardProps {
  fileInfo: FileInfo;
  label: string;
  onPreview: () => void;
}

export const FileViewCard: React.FC<FileViewCardProps> = ({
  fileInfo,
  label,
  onPreview,
}) => {
  const isImage = fileInfo.mimeType?.startsWith('image/');
  const isPdf = fileInfo.mimeType === 'application/pdf';

  return (
    <Card
      withBorder
      padding="sm"
      className="relative group cursor-pointer hover:shadow-md transition-shadow"
      onClick={onPreview}
    >
      {/* Preview del archivo */}
      <div className="flex items-center justify-center h-32 bg-gray-50 rounded-md overflow-hidden">
        {isImage ? (
          <Image
            src={fileInfo.url}
            alt={label}
            fit="cover"
            className="w-full h-full object-cover"
          />
        ) : isPdf ? (
          <FileText size={64} className="text-blue-500" />
        ) : (
          <FileText size={64} className="text-gray-400" />
        )}
      </div>

      {/* Overlay con icono de vista al hacer hover */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
        <ActionIcon
          variant="filled"
          color="blue"
          size="xl"
          radius="xl"
        >
          <Eye size={24} />
        </ActionIcon>
      </div>

      {/* Label del archivo */}
      <Text size="sm" mt="xs" ta="center" fw={500} className="truncate">
        {label}
      </Text>
    </Card>
  );
};
