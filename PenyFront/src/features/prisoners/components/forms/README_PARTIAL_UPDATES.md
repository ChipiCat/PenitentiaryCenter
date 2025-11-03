# Sistema de Actualización Parcial de Prisioneros

## 📋 Descripción

Este sistema implementa un mecanismo profesional de actualización parcial para el formulario de prisioneros, siguiendo las mejores prácticas de ingeniería de software.

## 🎯 Características Principales

### 1. **Dirty Tracking (Seguimiento de Cambios)**
- Detecta automáticamente qué secciones han sido modificadas
- Compara datos originales vs datos actuales
- Solo actualiza las secciones que tienen cambios reales

### 2. **Actualizaciones Parciales por Sección**
El sistema divide las actualizaciones en secciones independientes:

- **Datos Básicos**: `registration_number`, `admission_date`, `fiscal_file_number`, `status`
- **Identidad**: `surname`, `first_name`, `birth_date`, `citizenship_type`, etc.
- **Archivos**: Foto y huellas dactilares
- **Información Personal**: `gender`, `father_name`, `mother_name`, `education_level`, etc.
- **Registros Médicos**: Información médica del prisionero
- **Ubicación Penitenciaria**: `building_number`, `cell_number`, `bed_number`, `category`
- **Contactos**: Lista de contactos
- **Casos Legales**: Casos y mandatos judiciales

### 3. **Código Limpio y Mantenible**

#### Separación de Responsabilidades
```
forms/
├── types/
│   └── formState.ts                    # Tipos y interfaces
├── utils/
│   ├── changeDetection.ts              # Detección de cambios
│   └── sectionUpdater.ts               # Lógica de actualización
└── usePrisonerFormHandler.ts           # Hook principal
```

#### Principios Aplicados
- **Single Responsibility**: Cada módulo tiene una responsabilidad única
- **DRY (Don't Repeat Yourself)**: Lógica reutilizable en utilidades
- **SOLID**: Separación de interfaces y abstracciones claras
- **Clean Code**: Nombres descriptivos, funciones pequeñas y enfocadas

## 🚀 Uso

### Modo Creación
```typescript
<PrisonerFormWizard
  mode="create"
  initialData={initialData}
  onSuccess={(result) => {
    console.log('Prisionero creado:', result);
  }}
/>
```

### Modo Edición
```typescript
<PrisonerFormWizard
  mode="edit"
  prisonerId="uuid-del-prisionero"
  initialData={datosDelPrisionero}
  onSuccess={(result) => {
    console.log('Prisionero actualizado:', result);
  }}
/>
```

## 🔄 Flujo de Actualización

### 1. Detección de Cambios
```typescript
const dirtyState = detectDirtyState(
  originalData,    // Datos al cargar el formulario
  currentData,     // Datos actuales del formulario
  hasFiles         // Si hay archivos nuevos
);
```

### 2. Actualización Selectiva
Solo se actualizan las secciones donde `dirtyState[section] === true`

### 3. Feedback al Usuario
- Notificaciones de progreso durante la actualización
- Resumen de secciones actualizadas
- Mensajes de error específicos por sección

## 📊 Estructura de Datos

### FormState
```typescript
interface FormState {
  data: Partial<CreatePrisonerData>;
  files: FormFiles;
  dirty: DirtyState;
  errors: Record<string, string>;
}
```

### DirtyState
```typescript
interface DirtyState {
  prisoner: boolean;
  identity: boolean;
  personal: boolean;
  medical: boolean;
  penitentiary: boolean;
  contacts: boolean;
  cases: boolean;
  files: boolean;
}
```

## 🛠️ Funciones Principales

### `detectDirtyState()`
Compara datos originales con actuales y retorna qué secciones cambiaron.

```typescript
const dirtyState = detectDirtyState(originalData, currentData, hasFiles);
// Resultado: { prisoner: false, identity: true, personal: true, ... }
```

### `updateModifiedSections()`
Orquesta la actualización de todas las secciones modificadas.

```typescript
const { success, results } = await updateModifiedSections(
  prisonerId,
  originalData,
  currentData,
  files,
  dirtyState
);
```

### Actualizadores de Sección
Cada sección tiene su función específica:

- `updatePrisonerBasicData()`
- `updateIdentityData()`
- `updateIdentityFiles()`
- `updatePersonalData()`
- `updateMedicalData()`
- `updatePenitentiaryData()`
- `updateContactsData()`
- `updateCasesData()`

## ⚠️ Manejo de Errores

### Errores por Sección
Cada actualización puede fallar independientemente sin afectar las demás:

```typescript
{
  success: false,
  sectionName: 'Identidad',
  error: 'Error al actualizar identidad'
}
```

### Notificaciones
- **Azul**: Progreso
- **Verde**: Éxito completo
- **Amarillo**: Advertencias (ej: contactos sin endpoint de actualización)
- **Naranja**: Éxito parcial (algunas secciones fallaron)
- **Rojo**: Error completo

## 🔍 Validación

### Por Paso
Cada paso del wizard tiene validaciones específicas:

```typescript
const validation = validateStep(activeStep);
if (!validation.isValid) {
  // Mostrar errores y no permitir avanzar
}
```

### Campos Requeridos
- **Paso 0**: Datos básicos e identidad (todos requeridos)
- **Pasos 1-4**: Opcionales
- **Paso 5**: Casos legales (validación detallada de casos y mandatos)

## 📝 Interfaces de Actualización

### UpdateIdentityData
```typescript
{
  surname?: string;
  first_name?: string;
  birth_date?: string;
  birth_place?: string;
  residence?: string;
  citizenship_type?: string;
  country_of_origin?: string;
  nationality_type?: string;
  nationality?: string;
}
```

### UpdatePersonalData
```typescript
{
  gender?: string;
  father_name?: string;
  mother_name?: string;
  marital_status?: string;
  education_level?: string;
  occupation?: string;
  languages?: string;
  id_document_type?: string;
  id_document_number?: string;
}
```

### UpdateCaseData
```typescript
{
  case_number?: string;
  crime?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  court_name?: string;
  judge_name?: string;
  sentence_years?: number;
  remarks?: string;
}
```

### UpdateMandateData
```typescript
{
  type?: 'Detencion' | 'Condena' | 'Libertad' | 'Apelacion' | 'Traslado';
  issue_date?: string;
  description?: string;
  status?: 'Vigente' | 'Ejecutado' | 'Anulado';
}
```

## 🎨 Beneficios de Esta Arquitectura

1. **Performance**: Solo se actualizan los datos que cambiaron
2. **Confiabilidad**: Errores en una sección no afectan las demás
3. **Mantenibilidad**: Código modular y fácil de extender
4. **Testeable**: Funciones puras y aisladas
5. **UX Mejorado**: Feedback detallado al usuario
6. **Escalabilidad**: Fácil agregar nuevas secciones

## 🚦 Limitaciones Conocidas

### Contactos
Actualmente no hay endpoints específicos para actualizar contactos individuales. Se muestra una advertencia al usuario.

**Solución futura**: Implementar endpoints de actualización en el backend.

## 🔧 Extensibilidad

### Agregar Nueva Sección

1. **Actualizar DirtyState**:
```typescript
interface DirtyState {
  // ... existentes
  newSection: boolean;
}
```

2. **Crear función de actualización**:
```typescript
export async function updateNewSectionData(
  prisonerId: string,
  originalData: Partial<CreatePrisonerData>,
  currentData: Partial<CreatePrisonerData>
): Promise<SectionUpdateResult> {
  // Implementación
}
```

3. **Agregar en orquestador**:
```typescript
if (dirtyState.newSection) {
  const result = await updateNewSectionData(...);
  results.push(result);
}
```

## 📚 Referencias

- [Clean Code - Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [React Best Practices](https://react.dev/learn/thinking-in-react)
