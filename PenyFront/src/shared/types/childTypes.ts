import type { Entity } from "./commonTypes";

export interface Child extends Entity {
  name: string;
  birth_date?: string;
}

export interface CreateChildData {
  name: string;
  birth_date?: string;

}

export interface UpdateChildData {
  name?: string;
  birth_date?: string;
}