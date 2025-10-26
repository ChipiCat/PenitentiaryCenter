# 💼 Ejemplo de Uso - Prisoner Form Wizard

## 🎯 Ejemplo Completo de Implementación

### 1. Componente Padre - Crear Nuevo Prisionero

```tsx
// src/features/prisoners/pages/CreatePrisonerPage.tsx

import React from 'react';
import { Container, Title, Paper } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { PrisonerFormWizard } from '../components/forms/PrisonerFormWizard';

export const CreatePrisonerPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (result: { prisoner: PrisonerBase; id: string }) => {
    notifications.show({
      title: '✅ Registro Completado',
      message: `Prisionero ${result.prisoner.registration_number} registrado exitosamente`,
      color: 'green',
      autoClose: 5000
    });
    
    // Redirigir a la página de detalle
    navigate(`/prisoners/${result.id}`);
  };

  const handleCancel = () => {
    // Confirmar antes de cancelar
    if (window.confirm('¿Estás seguro de cancelar el registro? Los datos guardados se conservarán.')) {
      navigate('/prisoners');
    }
  };

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="lg">Registrar Nuevo Prisionero</Title>
      
      <Paper shadow="sm" p="md">
        <PrisonerFormWizard
          mode="create"
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </Paper>
    </Container>
  );
};
```

---

### 2. Componente Padre - Editar Prisionero Existente

```tsx
// src/features/prisoners/pages/EditPrisonerPage.tsx

import React, { useEffect, useState } from 'react';
import { Container, Title, Paper, LoadingOverlay, Alert } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { PrisonerFormWizard } from '../components/forms/PrisonerFormWizard';
import { prisonersService } from '../../../shared/services/prisonersService';
import { identityService } from '../../../shared/services/identityService';
import type { CreatePrisonerData } from '../../../shared/types';

export const EditPrisonerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<Partial<CreatePrisonerData>>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadPrisonerData(id);
    }
  }, [id]);

  const loadPrisonerData = async (prisonerId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Cargar datos en paralelo
      const [prisoner, identity] = await Promise.all([
        prisonersService.getPrisoner(prisonerId),
        identityService.getIdentity(prisonerId).catch(() => null) // Puede no existir
      ]);

      // Preparar datos iniciales
      const data: Partial<CreatePrisonerData> = {
        registration_number: prisoner.registration_number,
        admission_date: prisoner.admission_date,
        fiscal_file_number: prisoner.fiscal_file_number,
        status: prisoner.status,
      };

      // Agregar identidad si existe
      if (identity) {
        data.identity = {
          surname: identity.surname,
          first_name: identity.first_name,
          birth_date: identity.birth_date,
          birth_place: identity.birth_place,
          residence: identity.residence,
          citizenship_type: identity.citizenship_type,
          country_of_origin: identity.country_of_origin,
          nationality: identity.nationality,
          // Las URLs de archivos se pueden cargar si están disponibles
          profile_photo_url: identity.photo_file?.url,
          fingerprint_right_url: identity.right_fingerprint?.url,
          fingerprint_left_url: identity.left_fingerprint?.url,
        };
      }

      // TODO: Cargar datos de otros pasos aquí
      // const personal = await personalService.getPersonal(prisonerId);
      // data.personal = personal;
      
      // const medical = await medicalRecordsService.getMedicalRecords(prisonerId);
      // data.medical_record = medical.data;
      
      // etc...

      setInitialData(data);
    } catch (err: any) {
      console.error('Error loading prisoner data:', err);
      setError(err.message || 'Error al cargar los datos del prisionero');
      notifications.show({
        title: 'Error',
        message: 'No se pudieron cargar los datos del prisionero',
        color: 'red'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = (result: { prisoner: PrisonerBase; id: string }) => {
    notifications.show({
      title: '✅ Actualización Completada',
      message: `Prisionero ${result.prisoner.registration_number} actualizado exitosamente`,
      color: 'green',
      autoClose: 5000
    });
    
    navigate(`/prisoners/${result.id}`);
  };

  const handleCancel = () => {
    navigate(`/prisoners/${id}`);
  };

  if (isLoading) {
    return (
      <Container size="xl" py="xl">
        <LoadingOverlay visible />
      </Container>
    );
  }

  if (error || !id) {
    return (
      <Container size="xl" py="xl">
        <Alert color="red" title="Error">
          {error || 'ID de prisionero no válido'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Title order={1} mb="lg">Editar Prisionero</Title>
      
      <Paper shadow="sm" p="md">
        <PrisonerFormWizard
          mode="edit"
          prisonerId={id}
          initialData={initialData}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </Paper>
    </Container>
  );
};
```

---

### 3. Configurar Rutas

```tsx
// src/shared/config/routes.ts

export const routes = {
  // ... otras rutas
  prisoners: {
    list: '/prisoners',
    create: '/prisoners/new',
    edit: (id: string) => `/prisoners/${id}/edit`,
    detail: (id: string) => `/prisoners/${id}`,
  }
};
```

```tsx
// src/App.tsx o donde configures las rutas

import { Route, Routes } from 'react-router-dom';
import { CreatePrisonerPage } from './features/prisoners/pages/CreatePrisonerPage';
import { EditPrisonerPage } from './features/prisoners/pages/EditPrisonerPage';

function App() {
  return (
    <Routes>
      {/* ... otras rutas */}
      <Route path="/prisoners/new" element={<CreatePrisonerPage />} />
      <Route path="/prisoners/:id/edit" element={<EditPrisonerPage />} />
    </Routes>
  );
}
```

---

## 🎨 Botones de Navegación

### En la lista de prisioneros

```tsx
// src/features/prisoners/components/list/PrisonersTable.tsx

import { Button, ActionIcon } from '@mantine/core';
import { Plus, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PrisonersTable: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Botón para crear nuevo */}
      <Button
        leftSection={<Plus size={16} />}
        onClick={() => navigate('/prisoners/new')}
      >
        Nuevo Prisionero
      </Button>

      {/* Botón para editar en cada fila */}
      <ActionIcon
        variant="light"
        color="blue"
        onClick={() => navigate(`/prisoners/${prisoner.id}/edit`)}
      >
        <Edit size={16} />
      </ActionIcon>
    </>
  );
};
```

---

## 🔄 Ejemplo de Flujo Completo

### Escenario 1: Usuario crea un nuevo prisionero

```
1. Usuario navega a /prisoners/new
   ↓
2. Se renderiza CreatePrisonerPage
   ↓
3. Se muestra PrisonerFormWizard en modo "create"
   ↓
4. Usuario completa Paso 0:
   - Ingresa registration_number: "REG-2024-001"
   - Selecciona admission_date: "2024-10-26"
   - Ingresa fiscal_file_number: "EXP-2024-001"
   - Completa datos de identidad
   - Sube foto y huellas
   ↓
5. Usuario hace clic en "Siguiente"
   ↓
6. Sistema valida campos
   ✅ Todos los campos válidos
   ↓
7. Sistema guarda en secuencia:
   - POST /prisoners → Crea prisionero (ID: abc-123)
   - POST /prisoners/abc-123/identity → Crea identidad
   - POST /prisoners/abc-123/identity/upload-photo → Sube foto
   - POST /prisoners/abc-123/identity/upload-fingerprint → Sube huellas
   ↓
8. Notificación: "✅ Prisionero creado"
   ↓
9. Wizard avanza al Paso 1
   ↓
10. Usuario continúa llenando los demás pasos...
    ↓
11. En el último paso, hace clic en "Finalizar"
    ↓
12. Sistema llama onSuccess({ prisoner, id: "abc-123" })
    ↓
13. Página redirige a /prisoners/abc-123
```

### Escenario 2: Usuario edita un prisionero existente

```
1. Usuario navega a /prisoners/abc-123/edit
   ↓
2. Se renderiza EditPrisonerPage
   ↓
3. Sistema carga datos existentes:
   - GET /prisoners/abc-123
   - GET /prisoners/abc-123/identity
   - GET /prisoners/abc-123/personal
   - ... etc
   ↓
4. Datos se pasan como initialData al wizard
   ↓
5. Se muestra PrisonerFormWizard en modo "edit" con datos pre-llenados
   ↓
6. Usuario modifica algún campo en Paso 0:
   - Cambia fiscal_file_number a "EXP-2024-002"
   ↓
7. Usuario hace clic en "Siguiente"
   ↓
8. Sistema detecta cambios y actualiza:
   - PUT /prisoners/abc-123 → Actualiza datos básicos
   - (Identidad sin cambios, no se actualiza)
   ↓
9. Notificación: "✅ Prisionero actualizado"
   ↓
10. Wizard avanza al siguiente paso
    ↓
11. Usuario finaliza y sistema redirige
```

---

## 🧪 Testing Manual

### Checklist para Paso 0

#### Modo Creación:
- [ ] Abrir formulario en modo create
- [ ] Dejar todos los campos vacíos y hacer clic en "Siguiente"
- [ ] ✅ Debería mostrar errores en todos los campos requeridos
- [ ] Completar solo algunos campos y hacer clic en "Siguiente"
- [ ] ✅ Debería mostrar errores solo en campos faltantes
- [ ] Completar todos los campos sin archivos
- [ ] ✅ Debería guardar correctamente y avanzar
- [ ] Volver al Paso 0 y verificar que los datos persisten
- [ ] ✅ Los datos deberían estar guardados
- [ ] Subir foto de perfil
- [ ] ✅ Debería mostrar preview de la imagen
- [ ] Subir huellas dactilares
- [ ] ✅ Deberían subirse al backend
- [ ] Hacer clic en "Cancelar"
- [ ] ✅ Debería mostrar confirmación y volver atrás

#### Modo Edición:
- [ ] Abrir formulario en modo edit con ID válido
- [ ] ✅ Debería cargar datos existentes
- [ ] Modificar un campo y hacer clic en "Siguiente"
- [ ] ✅ Solo debería actualizar ese campo
- [ ] No modificar nada y hacer clic en "Siguiente"
- [ ] ✅ Debería avanzar sin hacer llamadas al backend
- [ ] Cambiar foto de perfil
- [ ] ✅ Debería reemplazar la foto existente

---

## 🐛 Manejo de Errores Comunes

### Error: "No se pudo obtener el ID del prisionero"

```typescript
// Causa: El backend no devolvió un ID al crear el prisionero
// Solución: Verificar que el endpoint POST /prisoners devuelva el objeto completo con ID

// Backend debe devolver:
{
  "id": "abc-123",
  "registration_number": "REG-2024-001",
  "admission_date": "2024-10-26",
  "fiscal_file_number": "EXP-2024-001",
  "status": "Activo",
  "created_at": "2024-10-26T10:30:00Z",
  "updated_at": "2024-10-26T10:30:00Z"
}
```

### Error: "Error al subir foto/huella"

```typescript
// Causa: El archivo es demasiado grande o formato incorrecto
// Solución: Validar en el frontend antes de intentar subir

// Agregar validación adicional en el dropzone:
onDrop={(files) => {
  const file = files[0] as File;
  
  // Validar tamaño
  if (file.size > 10 * 1024 * 1024) {
    notifications.show({
      title: 'Archivo muy grande',
      message: 'El archivo debe ser menor a 10MB',
      color: 'red'
    });
    return;
  }
  
  // Validar tipo
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    notifications.show({
      title: 'Formato no válido',
      message: 'Solo se aceptan imágenes JPG o PNG',
      color: 'red'
    });
    return;
  }
  
  onFileUpdate?.('photo', file);
}}
```

### Error: "Property 'identity' does not exist"

```typescript
// Causa: El tipo CreatePrisonerData no incluye el campo identity
// Solución: Ya está solucionado en prisonerTypes.ts, asegúrate de importar
// el tipo actualizado

import type { CreatePrisonerData } from '../../../shared/types/prisonerTypes';
```

---

## 📊 Estado del Formulario en Tiempo Real

### Para debugging, puedes agregar un componente temporal:

```tsx
// Agregar en PrisonerFormWizard.tsx (solo para desarrollo)

{process.env.NODE_ENV === 'development' && (
  <Card withBorder p="xs" mt="md" style={{ backgroundColor: '#f0f0f0' }}>
    <Text size="xs" fw={700}>Debug Info:</Text>
    <Text size="xs">Paso actual: {activeStep}</Text>
    <Text size="xs">Prisionero ID: {prisonerId || 'No creado'}</Text>
    <Text size="xs">Pasos guardados: {Array.from(savedSteps).join(', ')}</Text>
    <Text size="xs">Enviando: {isSubmitting ? 'Sí' : 'No'}</Text>
  </Card>
)}
```

---

## 🎯 Siguiente Paso: Implementar Paso 1

Una vez que hayas probado el Paso 0, implementa el Paso 1 siguiendo el mismo patrón:

```typescript
// En usePrisonerFormHandler.ts

const savePersonalInfoStep = useCallback(async (): Promise<{ success: boolean }> => {
  // ... implementación según GUIA_IMPLEMENTACION_PASOS.md
}, [mode, formData, formState]);

// En handleNext, agregar:
if (activeStep === 1) {
  const result = await savePersonalInfoStep();
  if (!result.success) {
    return;
  }
}
```

---

**✨ Con estos ejemplos ya puedes integrar el wizard en tu aplicación! 🚀**
