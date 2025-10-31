import type { Entity } from "./commonTypes";

export interface Child extends Entity {
  name: string;
  birth_date?: string;
}

export interface CreateChildData {
  full_name: string;
  birth_date?: string;

}

export interface UpdateChildData {
  full_name?: string;
  birth_date?: string;
}