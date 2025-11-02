import React from 'react';
import type { FileInfo } from '../types/filesTypes';
import { useFileManager } from '../hooks/useFileManager';
import { FileViewCard } from './FileView/FileViewCard';
import { FilePreviewModal } from './FileView/FilePreviewModal';
import { FileUploadModal } from './FileView/FileUploadModal';
import type { UploadResponse } from '../types';

interface FileViewProps {
  fileInfo: FileInfo;
  label: string;
  updateFile: (file: File) => Promise<UploadResponse>;
  onSuccess?: () => void;
  acceptImages?: boolean;
  acceptPdf?: boolean;
}

/**
 * Componente genérico para visualizar y editar archivos (imágenes y PDFs)
 * 
 * @param fileInfo - Información del archivo a mostrar
 * @param label - Etiqueta descriptiva del archivo
 * @param updateFile - Función async para actualizar el archivo
 * @param onSuccess - Callback opcional ejecutado después de actualización exitosa
 * @param acceptImages - Permitir subir imágenes (default: true)
 * @param acceptPdf - Permitir subir PDFs (default: true)
 * 
 * @example
 * ```tsx
 * <FileView
 *   fileInfo={profile.identity.photo_file}
 *   label="Foto de Perfil"
 *   updateFile={async (file) => {
 *     await identityService.uploadPhoto(prisonerId, file);
 *   }}
 *   onSuccess={() => refetch()}
 *   acceptImages={true}
 *   acceptPdf={false}
 * />
 * ```
 */
export const FileView: React.FC<FileViewProps> = ({
  fileInfo,
  label,
  updateFile,
  onSuccess,
  acceptImages = true,
  acceptPdf = true,
}) => {
  const {
    isPreviewOpen,
    isUploadOpen,
    isUploading,
    openPreview,
    closePreview,
    openUpload,
    closeUpload,
    handleFileUpdate,
  } = useFileManager({
    onFileUpdate: updateFile,
    onSuccess,
  });

  return (
    <>
      {/* Card con preview pequeño */}
      <FileViewCard
        fileInfo={fileInfo}
        label={label}
        onPreview={openPreview}
      />

      {/* Modal de visualización completa */}
      <FilePreviewModal
        isOpen={isPreviewOpen}
        onClose={closePreview}
        onEdit={() => {
          closePreview();
          openUpload();
        }}
        fileInfo={fileInfo}
        label={label}
      />

      {/* Modal de actualización de archivo */}
      <FileUploadModal
        isOpen={isUploadOpen}
        onClose={closeUpload}
        onUpload={handleFileUpdate}
        isUploading={isUploading}
        label={label}
        acceptImages={acceptImages}
        acceptPdf={acceptPdf}
      />
    </>
  );
};

export default FileView;