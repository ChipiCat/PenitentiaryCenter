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

// Tipo base para documentos
export interface Documents {
  photos?: File[];
  documents?: File[];
  medicalRecords?: File[];
}

// Tipo para formulario completo
export interface FormData {
  basicInfo: BasicInfo;
  contactInfo: ContactInfo;
  documents: Documents;
}

// 🔧 Tipo genérico para props de pasos del formulario
export interface FormStepProps<T = Record<string, unknown>> {
  data: T;
  onUpdate: (data: Partial<T>) => void;
}

// Props para componentes de pasos (usando el tipo genérico)
export interface BasicInfoStepProps extends FormStepProps<BasicInfo> {}

export interface ContactInfoStepProps extends FormStepProps<ContactInfo> {}

export interface DocumentsStepProps extends FormStepProps<Documents> {}

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
  onSubmit: (data: FormData) => Promise<boolean>;
  onCancel: () => void;
  initialData?: Partial<FormData>;
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