import type { Entity} from "./commonTypes";
import type { FileInfo } from "./filesTypes";

export interface Belonging extends Entity {
  description: string;
  quantity: number;
  condition?: string;
  is_returned: boolean;
  file: FileInfo| null;
  prisoner_id: string;
  tempId?: string; // ID temporal para tracking en formularios
}

export interface CreateBelongingData {
  description: string;
  quantity: number;
  condition?: string;
  returned?: boolean;
}

export interface UpdateBelongingData {
  description?: string;
  quantity?: number;
  condition?: string;
  returned?: boolean;
}