// Tipo base para información básica
export interface BasicInfo {
  firstName?: string;
  lastName?: string;
  age?: number;
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

// Tipo base para información de contacto
export interface ContactInfo {
  emergencyContact?: string;
  emergencyPhone?: string;
  relationship?: string;
  department?: string;
  city?: string;
  address?: string;
}

// 🔧 Actualizar interfaz Documents para coincidir con DocumentsStep.tsx
export interface Documents {
  // Documentos individuales (singular para single file)
  photo?: File;                    // Foto del recluso
  identificationDoc?: File;        // Documento de identificación
  medicalRecord?: File;           // Registro médico principal
  
  // Colecciones de documentos (plural para arrays)
  photos?: File[];                // Múltiples fotos
  documents?: File[];             // Documentos generales
  medicalRecords?: File[];        // Múltiples registros médicos
  legalDocuments?: File[];        // 🆕 Documentos legales
  
  // Metadatos adicionales
  uploadProgress?: Record<string, number>;
  uploadErrors?: Record<string, string>;
}

// Tipo para formulario completo
export interface FormData {
  basicInfo: BasicInfo;
  contactInfo: ContactInfo;
  documents: Documents;
}

// Tipo genérico para props de pasos del formulario
export interface FormStepProps<T = Record<string, unknown>> {
  data: T;
  onUpdate: (data: Partial<T>) => void;
}

// Usar type aliases en lugar de interfaces vacías para evitar el error de ESLint
export type BasicInfoStepProps = FormStepProps<BasicInfo>;
export type ContactInfoStepProps = FormStepProps<ContactInfo>;
export type DocumentsStepProps = FormStepProps<Documents>;

// Tipos específicos para actualizaciones
export type BasicInfoUpdate = Partial<BasicInfo>;
export type ContactInfoUpdate = Partial<ContactInfo>;  
export type DocumentsUpdate = Partial<Documents>;

// Tipos para validación
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: string[];
}

// Tipos para estado del formulario
export interface FormState {
  currentStep: number;
  isValid: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
}

// Props para el stepper completo
export interface FormStepperProps {
  activeStep: number;
  steps: StepInfo[];
}

// Tipos adicionales para pasos del stepper
export interface StepInfo {
  step: number;
  label: string;
  description: string;
  icon?: React.ReactNode;
}

export interface FormNavigationProps {
  activeStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  canGoNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onCancel: () => void;
  onFinish: () => Promise<void>;
}

// Tipos para manejo de archivos
export interface FileUploadState {
  isUploading: boolean;
  progress: number;
  error?: string;
}

// Tipos para validación de archivos
export interface FileValidationRules {
  maxSize: number; // en bytes
  allowedTypes: string[];
  maxFiles: number;
}

// Tipos para el estado de validación del formulario
export interface StepValidation {
  step: number;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  requiredFields: string[];
}

// 🆕 Tipos específicos para documentos
export type DocumentType = 
  | 'photo' 
  | 'identificationDoc' 
  | 'medicalRecord' 
  | 'legalDocuments';

// 🆕 Tipo para información de archivo subido
export interface UploadedFileInfo {
  file: File;
  preview?: string;
  uploadDate: Date;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

// 🆕 Configuración para cada tipo de documento
export interface DocumentConfig {
  type: DocumentType;
  label: string;
  description: string;
  accept: string;
  maxSize: number;
  maxFiles: number;
  required?: boolean;
}