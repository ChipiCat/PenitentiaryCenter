import type { Entity } from "./commonTypes";

export interface Penitentiary extends Entity {
  prisoner_id: string;
  category?: string;
  building_number?: string;
  cell_number?: string;
  bed_number?: string;
}

export interface CreatePenitentiaryData {
  category?: "DerechoComun" | "PrisionPreventiva" | "PrisioneroAcusado";
  building_number?: string;
  cell_number?: string;
  bed_number?: string;
}

export interface UpdatePenitentiaryData {
  category?: "DerechoComun" | "PrisionPreventiva" | "PrisioneroAcusado";
  building_number?: string;
  cell_number?: string;
  bed_number?: string;
}