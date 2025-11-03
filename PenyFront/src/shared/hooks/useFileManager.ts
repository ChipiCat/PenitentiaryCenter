import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import type { UploadResponse } from '../types';

interface UseFileManagerProps {
  onFileUpdate: (file: File) => Promise<UploadResponse>;
  onSuccess?: () => void;
}

export const useFileManager = ({ onFileUpdate, onSuccess }: UseFileManagerProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // ==================== CONTROL DE MODALES ====================
  const openPreview = useCallback(() => {
    setIsPreviewOpen(true);
  }, []);

  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  const openUpload = useCallback(() => {
    setIsUploadOpen(true);
  }, []);

  const closeUpload = useCallback(() => {
    setIsUploadOpen(false);
  }, []);

  // ==================== ACTUALIZACIÓN DE ARCHIVO ====================
  const handleFileUpdate = useCallback(async (file: File) => {
    setIsUploading(true);

    try {
      await onFileUpdate(file);

      notifications.show({
        title: 'Éxito',
        message: 'Archivo actualizado correctamente',
        color: 'green',
      });

      closeUpload();
      onSuccess?.();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Error al actualizar el archivo',
        color: 'red',
      });
    } finally {
      setIsUploading(false);
    }
  }, [onFileUpdate, onSuccess, closeUpload]);

  return {
    // Estados
    isPreviewOpen,
    isUploadOpen,
    isUploading,

    // Acciones
    openPreview,
    closePreview,
    openUpload,
    closeUpload,
    handleFileUpdate,
  };
};
