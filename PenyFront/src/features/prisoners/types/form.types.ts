// Información básica del formulario
export interface BasicInfo {
  firstName: string;
  lastName: string;
  age: number;
  identification: string;
  passport: string;
  fullName: string;
  idNumber: string;
  birthDate: string;
  gender: string;
  nationality: string;
  crime: string;
  sentence: string;
  cellBlock: string;
  legalStatus: string;
  behavior: string;
  workAssignment: string;
}

// Información de contacto
export interface ContactInfo {
  emergencyContact: string;
  emergencyPhone: string;
  relationship: string;
  department: string;
  city: string;
  address: string;
}

// Documentos
export interface Documents {
  photos: File[];
  documents: File[];
  medicalRecords: File[];
}

// Datos completos del formulario
export interface FormData {
  basicInfo: BasicInfo;
  contactInfo: ContactInfo;
  documents: Documents;
}

// Props genéricos para pasos del formulario
export interface FormStepProps<T> {
  data: T;
  onUpdate: (data: Partial<T>) => void;
}

// Tipos específicos para actualizaciones
export type BasicInfoUpdate = Partial<BasicInfo>;
export type ContactInfoUpdate = Partial<ContactInfo>;
export type DocumentsUpdate = Partial<Documents>;

// Props para pasos específicos
export interface BasicInfoStepProps extends FormStepProps<BasicInfo> {}
export interface ContactInfoStepProps extends FormStepProps<ContactInfo> {}
export interface DocumentsStepProps extends FormStepProps<Documents> {}