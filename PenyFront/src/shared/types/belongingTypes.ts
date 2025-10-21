import type { Entity } from "./commonTypes";

export interface Belonging extends Entity {
  prisoner_id: string;
  description: string;
  quantity: number;
  condition?: string;
  is_returned: boolean;
  attachment_url?: string;
}

export interface CreateBelongingData {
  description: string;
  quantity: number;
  condition?: string;
  is_returned?: boolean;
}

export interface UpdateBelongingData {
  description?: string;
  quantity?: number;
  condition?: string;
  is_returned?: boolean;
}