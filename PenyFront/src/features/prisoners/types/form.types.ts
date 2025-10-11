export interface BasicInfo {
  firstName?: string;
  lastName?: string;
  age?: number | string; // 🔧 Permitir string temporalmente
  identification?: string;
  passport?: string;
  fullName?: string;
  idNumber?: string;
  birthDate?: string;
  gender?: string;
  nationality?: string;
  crime?: string;
  sentence?: string;
  cellBlock?: string;
  legalStatus?: string;
  behavior?: string;
  workAssignment?: string;
}

export interface ContactInfo {
  emergencyContact?: string;
  emergencyPhone?: string;
  relationship?: string;
  department?: string;
  city?: string;
  address?: string;
}

export interface Documents {
  photos?: File[];
  documents?: File[];
  medicalRecords?: File[];
}

export interface FormStepProps<T> {
  data: T;
  onUpdate: (data: Partial<T>) => void;
}