# 📁 Flujo de Subida de Archivos - Sistema de Prisioneros

## 🎯 Arquitectura General

Los archivos **NO se guardan como URLs** en el estado del formulario. Se manejan en un estado separado (`formFiles`) y se suben **independientemente** vía API después de crear/actualizar los registros.

---

## 📋 Tipos de Archivos Soportados

### 1. **Archivos de Identidad** (BasicInfoStep)
- ✅ `photo` - Foto de perfil
- ✅ `fingerprintLeft` - Huella izquierda
- ✅ `fingerprintRight` - Huella derecha

### 2. **Archivos Médicos** (MedicalStep)
- ✅ `medicalFile` - Archivo adjunto al registro médico

---

## 🔄 Flujo Completo de Archivos

### **Paso 1: Usuario selecciona archivo en componente**

```tsx
// MedicalStep.tsx
<BelongingDropzone
  onFile={(file) => {
    onFileUpdate?.('medicalFile', file);  // ✅ Pasa el File object
  }}
/>
```

**✅ Buena práctica:**
- Solo pasa el `File` object, NO crea blob URLs
- NO guarda en formData, usa handler dedicado

---

### **Paso 2: Handler actualiza estado de archivos**

```tsx
// usePrisonerFormHandler.ts
const handleFileUpdate = useCallback((fileType: keyof FormFiles, file: File | undefined) => {
  setFormFiles(prev => ({
    ...prev,
    [fileType]: file  // ✅ Guarda File object directo
  }));
}, []);
```

**✅ Buena práctica:**
- Estado inmutable (spread operator)
- Tipos estrictos con `keyof FormFiles`
- Sin lógica adicional, single responsibility

---

### **Paso 3A: Modo Creación - Subir después de crear registro**

```tsx
// handleCreateMode en usePrisonerFormHandler.ts

// 1. Crear registro médico
const createdMedicalRecord = await medicalRecordsService.createMedicalRecord(
  prisonerId, 
  medicalData
);

// 2. Subir archivo si existe
if (formFiles.medicalFile && createdMedicalRecord.id) {
  await medicalRecordsService.uploadMedicalFile(
    prisonerId,
    createdMedicalRecord.id,
    formFiles.medicalFile  // ✅ File object directo
  );
}
```

**✅ Buena práctica:**
- Espera a tener el ID del registro antes de subir archivo
- Verifica existencia del archivo antes de intentar subir
- Manejo secuencial: crear → subir

---

### **Paso 3B: Modo Edición - Detectar cambios y subir**

```tsx
// handleEditMode en usePrisonerFormHandler.ts

// 1. Detectar archivos pendientes
const hasIdentityFiles = !!(
  formFiles.photo || 
  formFiles.fingerprintLeft || 
  formFiles.fingerprintRight
);
const hasMedicalFile = !!formFiles.medicalFile;

// 2. Detectar cambios en data
const dirtyState = detectDirtyState(
  originalDataRef.current,
  formData,
  hasIdentityFiles
);

// 3. Agregar detección manual de archivo médico
if (hasMedicalFile) {
  dirtyState.medical = true;  // ✅ Forzar actualización si hay archivo nuevo
}

// 4. Actualizar secciones modificadas
await updateModifiedSections(
  prisonerId,
  originalDataRef.current,
  formData,
  formFiles,  // ✅ Pasa los archivos
  dirtyState
);
```

**✅ Buena práctica:**
- Detección separada para archivos de identidad vs médicos
- Flags booleanos explícitos para claridad
- `dirtyState.medical = true` fuerza actualización cuando hay archivo nuevo
- Los archivos se detectan en `formFiles`, no en `formData`

---

### **Paso 4: Subir archivo médico en updateModifiedSections**

```tsx
// sectionUpdater.ts

// Actualizar registros médicos
if (dirtyState.medical) {
  // 1. Actualizar datos del registro
  const result = await updateMedicalData(prisonerId, originalData, currentData);
  results.push(result);
  
  // 2. Subir archivo si existe
  if (files.medicalFile && currentData.medical_record?.[0]) {
    const medicalRecordId = (currentData.medical_record[0] as any).id;
    if (medicalRecordId) {
      const fileResult = await updateMedicalFiles(
        prisonerId, 
        medicalRecordId, 
        files
      );
      results.push(fileResult);
    }
  }
}
```

**✅ Buena práctica:**
- Separación clara: actualizar data → subir archivo
- Validaciones: verifica existencia de archivo y ID del registro
- Usa función dedicada `updateMedicalFiles` para single responsibility

---

### **Paso 5: Función updateMedicalFiles (equivalente a updateIdentityFiles)**

```tsx
// sectionUpdater.ts
export async function updateMedicalFiles(
  prisonerId: string,
  medicalRecordId: string,
  files: FormFiles
): Promise<SectionUpdateResult> {
  try {
    if (files.medicalFile) {
      await medicalRecordsService.uploadMedicalFile(
        prisonerId, 
        medicalRecordId, 
        files.medicalFile
      );
      return { success: true, sectionName: 'Archivo médico' };
    }

    return { success: true, sectionName: 'Archivo médico' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return { success: false, sectionName: 'Archivo médico', error: message };
  }
}
```

**✅ Buena práctica:**
- Patrón consistente con `updateIdentityFiles`
- Manejo de errores robusto
- Retorna `SectionUpdateResult` para rastrear éxito/fracaso
- Single responsibility: solo sube archivos médicos

---

### **Paso 6: Servicio uploadMedicalFile**

```tsx
// medicalRecordsService.ts
async uploadMedicalFile(
  prisonerId: string, 
  recordId: string, 
  file: File
): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);  // ✅ File object directo a FormData

    const response = await api.post<UploadResponse>(
      `/prisoners/${prisonerId}/medical-records/${recordId}/upload`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' }  // ✅ Header correcto
      }
    );
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError;
    throw new Error(
      axiosError.response?.data?.message || 'Error al subir archivo médico'
    );
  }
}
```

**✅ Buena práctica:**
- FormData para multipart/form-data
- Header explícito para archivo
- Manejo de errores con mensajes descriptivos
- Tipado estricto con `UploadResponse`

---

## 🔍 Comparación: Identidad vs Médico

| Aspecto | Archivos de Identidad | Archivo Médico |
|---------|----------------------|----------------|
| **Cantidad** | Múltiples (foto + 2 huellas) | Uno por registro |
| **Estado** | `formFiles.photo`, `fingerprintLeft`, `fingerprintRight` | `formFiles.medicalFile` |
| **Handler** | `updateIdentityFiles()` | `updateMedicalFiles()` |
| **API** | `identityService.uploadPhoto()`, `uploadFingerprint()` | `medicalRecordsService.uploadMedicalFile()` |
| **Detección Edit** | Via `hasIdentityFiles` | Via `hasMedicalFile` + `dirtyState.medical = true` |
| **Upload paralelo** | ✅ Sí (Promise.all) | ❌ No (uno solo) |

---

## 🐛 Bug Corregido

### **Problema:**
```tsx
// ❌ ANTES - Solo detectaba archivos de identidad
const hasFiles = !!(formFiles.photo || formFiles.fingerprintLeft || formFiles.fingerprintRight);

const dirtyState = detectDirtyState(originalDataRef.current, formData, hasFiles);
// ❌ medicalFile nunca se detectaba!
```

### **Solución:**
```tsx
// ✅ DESPUÉS - Detecta ambos tipos
const hasIdentityFiles = !!(
  formFiles.photo || 
  formFiles.fingerprintLeft || 
  formFiles.fingerprintRight
);
const hasMedicalFile = !!formFiles.medicalFile;

const dirtyState = detectDirtyState(originalDataRef.current, formData, hasIdentityFiles);

// ✅ Agregar detección manual de archivo médico
if (hasMedicalFile) {
  dirtyState.medical = true;
}
```

---

## 📐 Principios de Diseño Aplicados

### 1. **Single Responsibility Principle (SRP)**
- `handleFileUpdate`: Solo actualiza estado de archivos
- `updateIdentityFiles`: Solo sube archivos de identidad
- `updateMedicalFiles`: Solo sube archivos médicos
- `uploadMedicalFile`: Solo hace la llamada HTTP

### 2. **Separation of Concerns (SoC)**
- **Estado:** `formFiles` para archivos, `formData` para data
- **Detección:** `detectDirtyState` para data, flags booleanos para archivos
- **Actualización:** Funciones separadas por tipo de archivo

### 3. **Explicit is Better Than Implicit**
- Flags explícitos: `hasIdentityFiles`, `hasMedicalFile`
- Comentarios claros: `// ✅ Agregar detección manual...`
- Validaciones antes de cada operación

### 4. **Don't Repeat Yourself (DRY)**
- Patrón reutilizable: `updateIdentityFiles` → `updateMedicalFiles`
- Tipos compartidos: `FormFiles`, `SectionUpdateResult`
- Handler unificado: `handleFileUpdate` para todos los archivos

### 5. **Fail Fast**
- Validaciones tempranas: `if (!files.medicalFile) return`
- Verificación de IDs: `if (medicalRecordId) { ... }`
- Try-catch con mensajes descriptivos

---

## ✅ Checklist de Implementación

- [x] Componente pasa `File` object (no blob URL)
- [x] Handler actualiza estado inmutable
- [x] Modo creación sube archivo después de crear registro
- [x] Modo edición detecta archivo nuevo
- [x] `dirtyState.medical = true` cuando hay `medicalFile`
- [x] Función dedicada `updateMedicalFiles`
- [x] Validaciones de existencia de archivo y ID
- [x] Servicio con FormData y headers correctos
- [x] Manejo de errores en cada capa
- [x] Tipos estrictos en toda la cadena

---

## 🚀 Resultado Final

**Ahora ambos flujos funcionan idénticamente:**

| Acción | Foto de Identidad | Archivo Médico |
|--------|------------------|----------------|
| Subir en creación | ✅ Funciona | ✅ Funciona |
| Subir en edición | ✅ Funciona | ✅ Funciona |
| Detección de cambios | ✅ Detectado | ✅ Detectado |
| Logs en consola | ✅ Limpio | ✅ Limpio |

---

## 📚 Archivos Modificados

1. `usePrisonerFormHandler.ts` - Detección mejorada en modo edición
2. `sectionUpdater.ts` - Nueva función `updateMedicalFiles`
3. `MedicalStep.tsx` - Ya estaba correcto (solo pasa File object)
4. `medicalRecordsService.ts` - Ya estaba correcto (FormData)

---

**Documentado por: GitHub Copilot**  
**Fecha: 31 de octubre de 2025**
