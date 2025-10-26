# 🎯 Diagrama de Flujo - Sistema de Guardado Progresivo

## 📊 Vista General del Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      PRISONER FORM WIZARD                               │
│                     (Modo: Create / Edit)                               │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
      ┌────────────────────────────────────────────────────────┐
      │        PASO 0: Información Básica e Identidad          │
      │              ✅ IMPLEMENTADO                            │
      └────────────────────────────────────────────────────────┘
                                   │
                    Clic en "Siguiente"
                                   │
                                   ▼
              ┌───────────────────────────────┐
              │   Validar todos los campos    │
              └───────────────────────────────┘
                         │           │
                    ✅ OK        ❌ Error
                         │           │
                         │           └──► Mostrar errores
                         │                  (No avanza)
                         ▼
      ┌────────────────────────────────────────────┐
      │    1. POST /prisoners                      │
      │       Crear/actualizar datos básicos       │
      └────────────────────────────────────────────┘
                         │
                         ▼
      ┌────────────────────────────────────────────┐
      │    2. POST /prisoners/{id}/identity        │
      │       Crear/actualizar identidad           │
      └────────────────────────────────────────────┘
                         │
                         ▼
      ┌────────────────────────────────────────────┐
      │    3. POST .../upload-photo                │
      │       Subir foto de perfil (si existe)     │
      └────────────────────────────────────────────┘
                         │
                         ▼
      ┌────────────────────────────────────────────┐
      │    4. POST .../upload-fingerprint          │
      │       Subir huellas (si existen)           │
      └────────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Notificar éxito ✅  │
              │  Marcar paso 0 como  │
              │     guardado         │
              └──────────────────────┘
                         │
                         ▼
      ┌────────────────────────────────────────────────────────┐
      │       PASO 1: Información Personal y Familiar          │
      │              ⏳ POR IMPLEMENTAR                         │
      └────────────────────────────────────────────────────────┘
                         │
                         ▼
                   (mismo flujo)
                         │
                         ▼
      ┌────────────────────────────────────────────────────────┐
      │           PASO 2: Examen Médico                        │
      │              ⏳ POR IMPLEMENTAR                         │
      └────────────────────────────────────────────────────────┘
                         │
                         ▼
      ┌────────────────────────────────────────────────────────┐
      │      PASO 3: Ubicación Penitenciaria                   │
      │              ⏳ POR IMPLEMENTAR                         │
      └────────────────────────────────────────────────────────┘
                         │
                         ▼
      ┌────────────────────────────────────────────────────────┐
      │            PASO 4: Contactos                           │
      │              ⏳ POR IMPLEMENTAR                         │
      └────────────────────────────────────────────────────────┘
                         │
                         ▼
      ┌────────────────────────────────────────────────────────┐
      │         PASO 5: Información Legal                      │
      │              ⏳ POR IMPLEMENTAR                         │
      └────────────────────────────────────────────────────────┘
                         │
              Clic en "Finalizar"
                         │
                         ▼
              ┌──────────────────────┐
              │   Guardar último     │
              │       paso           │
              └──────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Notificar éxito ✅  │
              │  Llamar onSuccess()  │
              └──────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Redirigir o cerrar  │
              └──────────────────────┘
```

---

## 🔄 Detalle del Paso 0 (Implementado)

### Componentes Involucrados

```
┌───────────────────────────────────────────────────────────────────┐
│                    PrisonerFormWizard                             │
│  Props: mode, prisonerId, initialData, onSuccess, onCancel       │
└───────────────────────────────────────────────────────────────────┘
                              │
                              │ usa
                              ▼
┌───────────────────────────────────────────────────────────────────┐
│                 usePrisonerFormHandler (Hook)                     │
│  Estado:                                                          │
│    - formData: Partial<CreatePrisonerData>                        │
│    - errors: Record<string, string>                               │
│    - activeStep: number                                           │
│    - isSubmitting: boolean                                        │
│    - formState: { prisonerId, files, savedSteps }                 │
│                                                                   │
│  Funciones:                                                       │
│    - validateStep(step): valida campos requeridos                 │
│    - saveBasicInfoStep(): guarda paso 0                          │
│    - handleDataUpdate(updates): actualiza formData                │
│    - handleFileUpdate(type, file): guarda archivos                │
│    - handleNext(): valida y guarda antes de avanzar               │
│    - handlePrevious(): retrocede sin guardar                      │
│    - handleSubmit(): finaliza el registro                         │
└───────────────────────────────────────────────────────────────────┘
                              │
                              │ renderiza
                              ▼
┌───────────────────────────────────────────────────────────────────┐
│                      BasicInfoStep                                │
│  Props: data, onUpdate, onFileUpdate, errors                     │
│                                                                   │
│  Campos:                                                          │
│    Datos Básicos:                                                 │
│      ✓ registration_number (TextInput)                            │
│      ✓ admission_date (DatePicker)                                │
│      ✓ fiscal_file_number (TextInput)                             │
│                                                                   │
│    Identidad:                                                     │
│      ✓ profile_photo (Dropzone)                                   │
│      ✓ fingerprint_left (Dropzone)                                │
│      ✓ fingerprint_right (Dropzone)                               │
│      ✓ surname (TextInput)                                        │
│      ✓ first_name (TextInput)                                     │
│      ✓ birth_date (DatePicker)                                    │
│      ✓ birth_place (TextInput)                                    │
│      ✓ residence (Textarea)                                       │
│      ✓ citizenship_type (Select)                                  │
│      ✓ country_of_origin (TextInput)                              │
│      ✓ nationality (SelectWithOther)                              │
│      ✓ nationality_type (SelectWithOther)                         │
└───────────────────────────────────────────────────────────────────┘
```

---

## 🔀 Flujo de Datos

### 1. Usuario ingresa datos

```
Usuario escribe en campo
         │
         ▼
handleDataUpdate({ field: value })
         │
         ▼
setFormData(prev => ({ ...prev, field: value }))
         │
         ▼
Re-render del componente con nuevos datos
```

### 2. Usuario sube archivo

```
Usuario arrastra archivo al Dropzone
         │
         ▼
onFile(file) llamado
         │
         ├──► handleFileUpdate('photo', file)
         │    └──► Guarda en formState.photoFile
         │
         └──► handleIdentityChange('profile_photo_url', URL)
              └──► Actualiza preview en formData
```

### 3. Usuario hace clic en "Siguiente"

```
handleNext()
    │
    ├──► validateStep(0)
    │    │
    │    ├──► ❌ Errores encontrados
    │    │    └──► setErrors({ ... })
    │    │         └──► Mostrar notificación roja
    │    │              └──► RETURN (no avanza)
    │    │
    │    └──► ✅ Sin errores
    │         └──► continuar...
    │
    └──► saveBasicInfoStep()
         │
         ├──► 1. POST /prisoners
         │    └──► Guardar prisonerId
         │
         ├──► 2. POST /prisoners/{id}/identity
         │
         ├──► 3. POST .../upload-photo
         │
         ├──► 4. POST .../upload-fingerprint (right)
         │
         ├──► 5. POST .../upload-fingerprint (left)
         │
         ├──► ✅ Success
         │    └──► Marcar savedSteps.add(0)
         │         └──► setActiveStep(1)
         │              └──► Avanzar al siguiente paso
         │
         └──► ❌ Error
              └──► Mostrar notificación roja
                   └──► RETURN (no avanza)
```

---

## 🎨 Estados Visuales

### Durante el guardado:

```
┌─────────────────────────────────────────────┐
│  [Overlay con spinner]                      │
│                                             │
│  ┌───────────────────────────┐             │
│  │  Guardando información... │             │
│  │         🔄                │             │
│  └───────────────────────────┘             │
│                                             │
│  [Botones deshabilitados]                   │
└─────────────────────────────────────────────┘
```

### Notificación de éxito:

```
┌─────────────────────────────────────────┐
│ ✅ Prisionero creado                    │
│ Los datos básicos se guardaron          │
│ correctamente                           │
└─────────────────────────────────────────┘
```

### Notificación de error:

```
┌─────────────────────────────────────────┐
│ ❌ Error al guardar                     │
│ No se pudo conectar con el servidor     │
└─────────────────────────────────────────┘
```

### Errores en campos:

```
┌────────────────────────────────────────┐
│ Número de Registro *                   │
│ ┌────────────────────────────────────┐ │
│ │                                    │ │
│ └────────────────────────────────────┘ │
│ ⚠️ El número de registro es requerido  │
└────────────────────────────────────────┘
```

---

## 📦 Estructura de Datos

### FormData (Estado Principal)

```typescript
{
  // Paso 0
  registration_number: "REG-2024-001",
  admission_date: "2024-10-26",
  fiscal_file_number: "EXP-2024-001",
  status: "Activo",
  
  identity: {
    surname: "Pérez",
    first_name: "Juan",
    birth_date: Date("1990-05-15"),
    birth_place: "La Paz, Bolivia",
    residence: "Calle Principal #123",
    citizenship_type: "Natural",
    country_of_origin: "Bolivia",
    nationality: "Boliviana",
    nationality_type: "Por nacimiento",
    profile_photo_url: "blob:http://...",
    fingerprint_right_url: "blob:http://...",
    fingerprint_left_url: "blob:http://..."
  },
  
  // Paso 1 (por implementar)
  personal: { ... },
  belonging: { ... },
  child: [ ... ],
  
  // Paso 2 (por implementar)
  medical_record: [ ... ],
  
  // Paso 3 (por implementar)
  penitentiary: { ... },
  
  // Paso 4 (por implementar)
  contacts: [ ... ],
  
  // Paso 5 (por implementar)
  legal: { ... }
}
```

### FormState (Estado Interno)

```typescript
{
  prisoner: PrisonerBase | undefined,
  prisonerId: "uuid-123-456" | undefined,
  
  // Archivos temporales para subir
  photoFile: File | undefined,
  fingerprintLeftFile: File | undefined,
  fingerprintRightFile: File | undefined,
  
  // Control de pasos guardados
  savedSteps: Set([0])  // Paso 0 guardado
}
```

---

## 🔐 Validaciones

### Paso 0 - Campos Requeridos

```javascript
✅ registration_number  → "El número de registro es requerido"
✅ admission_date      → "La fecha de ingreso es requerida"
✅ fiscal_file_number  → "El número de expediente fiscal es requerido"

// Identidad
✅ identity.surname           → "Los apellidos son requeridos"
✅ identity.first_name        → "Los nombres son requeridos"
✅ identity.birth_date        → "La fecha de nacimiento es requerida"
✅ identity.birth_place       → "El lugar de nacimiento es requerido"
✅ identity.residence         → "El domicilio es requerido"
✅ identity.citizenship_type  → "El tipo de ciudadanía es requerido"
✅ identity.country_of_origin → "El país de origen es requerido"
✅ identity.nationality       → "La nacionalidad es requerida"
✅ identity.nationality_type  → "El tipo de nacionalidad es requerido"
```

---

## 🧩 Integración con Servicios

### prisonersService.ts

```typescript
✅ createPrisoner(data: CreatePrisonerData): Promise<PrisonerBase>
✅ updatePrisoner(id: string, data: UpdatePrisonerData): Promise<PrisonerBase>
```

### identityService.ts

```typescript
✅ createIdentity(prisonerId: string, data: CreateIdentityData): Promise<Identity>
✅ updateIdentity(prisonerId: string, data: UpdateIdentityData): Promise<Identity>
✅ uploadPhoto(prisonerId: string, file: File): Promise<UploadResponse>
✅ uploadFingerprint(prisonerId: string, file: File, hand: HandType): Promise<UploadResponse>
```

---

## 🎯 Próximos Pasos a Implementar

```
┌─────────────────────────────────────────────────────────────┐
│ PASO 1: Información Personal                               │
│ Services: personalService, belongingsService,              │
│           childrenService                                   │
│ Complejidad: ⭐⭐⭐⭐ (Alta - múltiples entidades)          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PASO 2: Examen Médico                                      │
│ Service: medicalRecordsService                             │
│ Complejidad: ⭐⭐ (Media - un solo registro)               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PASO 3: Ubicación Penitenciaria                            │
│ Service: penitentiaryService                               │
│ Complejidad: ⭐ (Baja - un solo objeto)                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PASO 4: Contactos                                          │
│ Service: contactsService                                   │
│ Complejidad: ⭐⭐⭐ (Media-Alta - array de contactos)      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ PASO 5: Información Legal                                  │
│ Services: casesService, mandatesService                    │
│ Complejidad: ⭐⭐⭐ (Media-Alta - múltiples servicios)     │
└─────────────────────────────────────────────────────────────┘
```

---

**✨ Sistema de guardado progresivo - Paso 0 completamente implementado y listo para extender! 🚀**
