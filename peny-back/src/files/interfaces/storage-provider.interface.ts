import { File as MulterFile } from 'multer';

export interface UploadResult {
  url: string;
  storagePath?: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface IStorageProvider {
  uploadFile(file: MulterFile, folder: string): Promise<UploadResult>;
  deleteFile(storagePath: string): Promise<void>;
}
