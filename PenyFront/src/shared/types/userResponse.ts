import type { Entity } from "./commonTypes";

export interface User extends Entity {
    name: string;
    email: string;
    role: string;
    photoUrl: string;
    celular?: string;
    ci?: string;
    departamento?: string;
    unidadDireccionDepartamental?: string;
}
