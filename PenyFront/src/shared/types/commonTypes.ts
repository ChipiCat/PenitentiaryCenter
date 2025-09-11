export interface Entity {
    id: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
}