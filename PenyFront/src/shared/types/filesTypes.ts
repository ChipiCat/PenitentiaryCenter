export interface FileInfo {
    id: string;
    url: string;
    storagePath: string;
    filename: string;
    originalName: string;
    mimeType: string;
    extension: string;
    size: number;
    storageType: string;
    entityType: string;
    entityId: string;
    fieldName: string;
    createdBy: string;
    createdAt: string;
    deletedAt: string | null;
}