# FileView Component - Documentación

## 📋 Descripción General

`FileView` es un componente genérico reutilizable para **visualizar y editar archivos** (imágenes y PDFs) de manera elegante y profesional. Implementado siguiendo principios SOLID y buenas prácticas de React.

## 🏗️ Arquitectura

### Estructura de Componentes
```
FileView (Orquestador)
├── FileViewCard (Card con preview)
├── FilePreviewModal (Modal de visualización)
├── FileUploadModal (Modal de actualización)
└── useFileManager (Hook de lógica)
```

### Separación de Responsabilidades

**FileView** (Main Component)
- Orquesta los sub-componentes
- Maneja props y callbacks
- Integra el hook de lógica

**FileViewCard** (Presentation)
- Muestra preview pequeño del archivo
- Icono PDF o imagen thumbnail
- Hover effect con botón de vista
- Click para abrir modal de preview

**FilePreviewModal** (Viewer)
- Modal grande para visualización completa
- Imágenes: muestra en tamaño completo
- PDFs: iframe con visor del navegador
- Botón de editar sutil en el header

**FileUploadModal** (Editor)
- Dropzone de Mantine
- Validación de tipo y tamaño
- Preview del archivo seleccionado
- Upload con loading state

**useFileManager** (Business Logic)
- Estados de modales (preview/upload)
- Loading states
- Manejo de errores
- Notificaciones

## 📁 Archivos Creados

### 1. Hook de Lógica
**`shared/hooks/useFileManager.ts`**
```typescript
export const useFileManager = ({ onFileUpdate, onSuccess }) => {
  // Control de modales
  // Upload de archivos
  // Notificaciones
}
```

### 2. Card de Vista Previa
**`shared/components/FileView/FileViewCard.tsx`**
- Card con imagen o icono PDF
- Hover effect elegante
- Click handler para preview

### 3. Modal de Visualización
**`shared/components/FileView/FilePreviewModal.tsx`**
- Modal XL centrado
- Imagen en tamaño completo o iframe PDF
- Botón de editar en header

### 4. Modal de Actualización
**`shared/components/FileView/FileUploadModal.tsx`**
- Dropzone con drag & drop
- Validación de tipos (image/*, application/pdf)
- Límite de 5MB
- Preview de archivo seleccionado

### 5. Componente Principal
**`shared/components/FileView.tsx`**
- Integra todos los sub-componentes
- Props bien documentadas
- JSDoc completo

### 6. Barril de Exportación
**`shared/components/FileView/index.ts`**
- Exports limpios y organizados

## 🎨 Props del Componente

```typescript
interface FileViewProps {
  fileInfo: FileInfo;              // Información del archivo
  label: string;                   // Etiqueta descriptiva
  updateFile: (file: File) => Promise<void>; // Función de actualización
  onSuccess?: () => void;          // Callback post-actualización
  acceptImages?: boolean;          // Permitir imágenes (default: true)
  acceptPdf?: boolean;            // Permitir PDFs (default: true)
}
```

## 💡 Ejemplos de Uso

### Caso 1: Foto de Perfil (Solo Imágenes)
```tsx
import { FileView } from '@/shared/components/FileView';
import { identityService } from '@/shared/services/identityService';

function ProfileSection({ profile, onRefresh }) {
  if (!profile.identity?.photo_file) return null;

  return (
    <FileView
      fileInfo={profile.identity.photo_file}
      label="Foto de Perfil"
      updateFile={async (file) => {
        await identityService.uploadPhoto(profile.prisoner.id, file);
      }}
      onSuccess={onRefresh}
      acceptImages={true}
      acceptPdf={false}
    />
  );
}
```

### Caso 2: Huella Dactilar (Imagen o PDF)
```tsx
function FingerprintSection({ profile, onRefresh, hand }) {
  const fingerprint = hand === 'left' 
    ? profile.identity?.left_fingerprint 
    : profile.identity?.right_fingerprint;

  if (!fingerprint) return null;

  return (
    <FileView
      fileInfo={fingerprint}
      label={`Huella ${hand === 'left' ? 'Izquierda' : 'Derecha'}`}
      updateFile={async (file) => {
        await identityService.uploadFingerprint(
          profile.prisoner.id, 
          file, 
          hand
        );
      }}
      onSuccess={onRefresh}
      acceptImages={true}
      acceptPdf={true}
    />
  );
}
```

### Caso 3: Documento PDF (Solo PDF)
```tsx
function DocumentSection({ belonging, onRefresh }) {
  if (!belonging.file) return null;

  return (
    <FileView
      fileInfo={belonging.file}
      label={belonging.description}
      updateFile={async (file) => {
        await belongingsService.updateBelongingFile(
          belonging.prisoner_id,
          belonging.id,
          file
        );
      }}
      onSuccess={onRefresh}
      acceptImages={false}
      acceptPdf={true}
    />
  );
}
```

### Caso 4: Grid de Archivos
```tsx
function FilesGrid({ files, onRefresh }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {files.map((file) => (
        <FileView
          key={file.id}
          fileInfo={file}
          label={file.name}
          updateFile={async (newFile) => {
            await filesService.updateFile(file.id, newFile);
          }}
          onSuccess={onRefresh}
        />
      ))}
    </div>
  );
}
```

## 🎯 Características

### UI/UX
- ✅ Card elegante con hover effect
- ✅ Preview pequeño (imagen) o icono (PDF)
- ✅ Modal grande para visualización completa
- ✅ Botón de editar sutil en modal de preview
- ✅ Dropzone con drag & drop
- ✅ Loading states durante upload
- ✅ Notificaciones de éxito/error
- ✅ Responsive design

### Validaciones
- ✅ Tipos de archivo (MIME types)
- ✅ Tamaño máximo: 5MB
- ✅ Solo un archivo a la vez
- ✅ Preview antes de subir

### Arquitectura
- ✅ Separación de concerns (UI/Logic)
- ✅ Hook reutilizable
- ✅ TypeScript estricto
- ✅ Props bien tipadas
- ✅ Componentes modulares
- ✅ Clean code

## 🔧 Tecnologías Utilizadas

- **React 18+**: Hooks, funcional components
- **TypeScript**: Strict mode
- **Mantine UI v7**: Modal, Dropzone, Card, Image, Group, Stack, Button
- **Lucide React**: Icons (Upload, X, FileText, Eye, Edit3)
- **Tailwind CSS**: Utility classes

## 🚀 Flujo de Interacción

### Visualización
1. Usuario ve Card con preview
2. Hover muestra overlay con icono de vista
3. Click en Card → Abre `FilePreviewModal`
4. Modal muestra:
   - **Imagen**: Tamaño completo (max-h-70vh)
   - **PDF**: Iframe con visor del navegador

### Edición
1. Desde `FilePreviewModal`, click en botón editar (icono lápiz)
2. Cierra modal de preview
3. Abre `FileUploadModal` con Dropzone
4. Usuario arrastra o selecciona archivo
5. Preview del archivo seleccionado
6. Click en "Actualizar Archivo"
7. Hook ejecuta `updateFile(file)`
8. Muestra notificación de éxito/error
9. Ejecuta `onSuccess()` callback
10. Cierra modal de upload

## 📊 Decisiones de Diseño

### ¿Por qué Cards separados?
- Permite grid layouts flexibles
- Reutilizable en diferentes contextos
- Hover states individuales

### ¿Por qué dos modales?
- Separación de responsabilidades
- UX más clara (ver vs editar)
- Mejor flujo de interacción

### ¿Por qué hook separado?
- Lógica reutilizable
- Testing más fácil
- Reducción de código en componentes

### ¿Por qué async updateFile?
- Flexibilidad para diferentes servicios
- Manejo de errores centralizado
- Loading states apropiados

## 🧪 Testing Sugerido

### Casos de Prueba
1. **Preview de imagen**: Verificar que se muestra correctamente
2. **Preview de PDF**: Verificar iframe funcional
3. **Upload exitoso**: Subir archivo y verificar notificación
4. **Upload fallido**: Simular error y verificar notificación
5. **Validación de tipo**: Intentar subir archivo no permitido
6. **Validación de tamaño**: Intentar subir archivo > 5MB
7. **Cancelar upload**: Verificar que modal se cierra sin cambios
8. **Responsividad**: Probar en diferentes tamaños de pantalla

## 📝 Notas de Implementación

### FileInfo Type
```typescript
interface FileInfo {
  id: string;
  url: string;
  mimeType?: string;
  originalName?: string;
  size?: number;
}
```

### MIME Types Soportados
- **Imágenes**: `image/png`, `image/jpeg`, `image/gif`, `image/webp`, etc.
- **PDFs**: `application/pdf`

### Límites
- Tamaño máximo: **5MB**
- Un archivo a la vez
- No múltiple upload

## ✅ Checklist de Verificación

- ✅ TypeScript sin errores
- ✅ Componentes modulares
- ✅ Props bien documentadas
- ✅ Hook reutilizable
- ✅ Loading states
- ✅ Error handling
- ✅ Notificaciones
- ✅ Validaciones
- ✅ Responsive
- ✅ Accessibility (aria-labels)
- ✅ Clean code
- ✅ JSDoc completo

## 🔄 Integración con Sistemas Existentes

### Compatible con:
- ✅ Identity Service (photo, fingerprints)
- ✅ Belongings Service (attachment files)
- ✅ Cualquier servicio con upload de archivos

### No requiere:
- ❌ Configuración adicional
- ❌ Context providers
- ❌ Redux/Estado global

## 📦 Exports

```typescript
// Componente principal
import { FileView } from '@/shared/components/FileView';

// Sub-componentes (uso avanzado)
import { 
  FileViewCard, 
  FilePreviewModal, 
  FileUploadModal 
} from '@/shared/components/FileView';

// Hook (uso avanzado)
import { useFileManager } from '@/shared/hooks/useFileManager';
```

---

**Fecha de Implementación**: 2 de noviembre de 2025  
**Patrón**: Component-Hook Architecture  
**Estado**: ✅ Producción Ready
