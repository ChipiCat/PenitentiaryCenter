# Guía de Implementación - Guardado Progresivo por Pasos

## 📋 Resumen de Cambios Implementados

Se ha implementado un sistema de guardado progresivo para el formulario de registro de prisioneros. El sistema guarda la información a medida que el usuario avanza por los pasos, evitando pérdida de datos.

### ✅ Paso 0 - Información Básica e Identidad (IMPLEMENTADO)

**Flujo de guardado:**
1. Validación de campos requeridos
2. Crear/actualizar datos básicos del prisionero (POST/PUT `/prisoners`)
3. Crear/actualizar datos de identidad (POST/PUT `/prisoners/{id}/identity`)
4. Subir foto de perfil (POST `/prisoners/{id}/identity/upload-photo`)
5. Subir huellas dactilares (POST `/prisoners/{id}/identity/upload-fingerprint`)

**Archivos modificados:**
- ✅ `usePrisonerFormHandler.ts` - Lógica principal de guardado
- ✅ `PrisonerFormWizard.tsx` - Props actualizadas (mode, prisonerId)
- ✅ `BasicInfoStep.tsx` - Manejo de archivos y datos
- ✅ `prisonerTypes.ts` - Tipos extendidos para todos los pasos

**Características:**
- Guarda automáticamente al hacer clic en "Siguiente"
- Valida campos requeridos antes de guardar
- Muestra notificaciones de éxito/error
- Maneja modo creación y edición
- Sube archivos después de crear identidad

---

## 🔧 Cómo Implementar los Siguientes Pasos

### Estructura General

Cada paso debe seguir este patrón en `usePrisonerFormHandler.ts`:

```typescript
/**
 * Guarda los datos del paso N (Nombre del paso)
 */
const saveStepN = useCallback(async (): Promise<{ success: boolean }> => {
  try {
    setIsSubmitting(true);

    if (!formState.prisonerId) {
      throw new Error('No se ha creado el prisionero aún');
    }

    // 1. Preparar datos
    const data = {
      // ... extraer datos de formData
    };

    // 2. Llamar al servicio apropiado
    if (mode === 'create') {
      await serviceX.create(formState.prisonerId, data);
    } else {
      await serviceX.update(formState.prisonerId, data);
    }

    // 3. Mostrar notificación
    notifications.show({
      title: 'Datos guardados',
      message: 'La información se guardó correctamente',
      color: 'green'
    });

    // 4. Marcar paso como guardado
    setFormState(prev => ({
      ...prev,
      savedSteps: new Set([...prev.savedSteps, N])
    }));

    return { success: true };
  } catch (error: any) {
    notifications.show({
      title: 'Error al guardar',
      message: error.message || 'Ocurrió un error',
      color: 'red'
    });
    return { success: false };
  } finally {
    setIsSubmitting(false);
  }
}, [mode, formData, formState]);
```

---

## 📝 Paso 1 - Información Personal

### Servicios necesarios:
- `personalService.ts` - Para datos personales
- `belongingsService.ts` - Para pertenencias
- `childrenService.ts` - Para hijos

### Validación requerida (agregar en `validateStep`):
```typescript
if (step === 1) {
  // Validar personal
  if (!formData.personal?.education_level) {
    newErrors['personal.education_level'] = 'El nivel de educación es requerido';
  }
  // ... otros campos personales
  
  // Validar belonging si existe
  if (formData.belonging) {
    // validaciones de pertenencias
  }
  
  // Validar children si existen
  if (formData.child && formData.child.length > 0) {
    formData.child.forEach((child, idx) => {
      if (!child.full_name) {
        newErrors[`child.${idx}.full_name`] = 'El nombre es requerido';
      }
    });
  }
}
```

### Implementación del guardado:
```typescript
const savePersonalInfoStep = useCallback(async (): Promise<{ success: boolean }> => {
  try {
    setIsSubmitting(true);
    
    if (!formState.prisonerId) {
      throw new Error('No se ha creado el prisionero aún');
    }

    // 1. Guardar datos personales
    if (formData.personal) {
      if (mode === 'create') {
        await personalService.createPersonal(formState.prisonerId, formData.personal);
      } else {
        await personalService.updatePersonal(formState.prisonerId, formData.personal);
      }
    }

    // 2. Guardar pertenencias
    if (formData.belonging) {
      if (mode === 'create') {
        await belongingsService.createBelonging(formState.prisonerId, formData.belonging);
      } else {
        await belongingsService.updateBelonging(formState.prisonerId, formData.belonging);
      }
    }

    // 3. Guardar hijos
    if (formData.child && formData.child.length > 0) {
      for (const child of formData.child) {
        if (mode === 'create') {
          await childrenService.createChild(formState.prisonerId, child);
        } else if (child.id) {
          await childrenService.updateChild(formState.prisonerId, child.id, child);
        }
      }
    }

    notifications.show({
      title: 'Información personal guardada',
      message: 'Los datos personales se guardaron correctamente',
      color: 'green'
    });

    setFormState(prev => ({
      ...prev,
      savedSteps: new Set([...prev.savedSteps, 1])
    }));

    return { success: true };
  } catch (error: any) {
    notifications.show({
      title: 'Error al guardar',
      message: error.message || 'Ocurrió un error al guardar la información personal',
      color: 'red'
    });
    return { success: false };
  } finally {
    setIsSubmitting(false);
  }
}, [mode, formData, formState]);
```

### Agregar al `handleNext`:
```typescript
if (activeStep === 1) {
  const result = await savePersonalInfoStep();
  if (!result.success) {
    return;
  }
}
```

---

## 🏥 Paso 2 - Examen Médico

### Servicio necesario:
- `medicalRecordsService.ts`

### Validación requerida:
```typescript
if (step === 2) {
  if (formData.medical_record && formData.medical_record.length > 0) {
    const medical = formData.medical_record[0];
    if (!medical.doctor_name) {
      newErrors['medical.doctor_name'] = 'El nombre del doctor es requerido';
    }
    if (!medical.examination_date) {
      newErrors['medical.examination_date'] = 'La fecha de examen es requerida';
    }
    // ... otros campos médicos
  }
}
```

### Implementación:
```typescript
const saveMedicalStep = useCallback(async (): Promise<{ success: boolean }> => {
  try {
    setIsSubmitting(true);
    
    if (!formState.prisonerId) {
      throw new Error('No se ha creado el prisionero aún');
    }

    if (formData.medical_record && formData.medical_record.length > 0) {
      const medicalData = formData.medical_record[0];
      
      if (mode === 'create') {
        await medicalRecordsService.createMedicalRecord(formState.prisonerId, medicalData);
      } else if (medicalData.id) {
        await medicalRecordsService.updateMedicalRecord(
          formState.prisonerId, 
          medicalData.id, 
          medicalData
        );
      }

      notifications.show({
        title: 'Datos médicos guardados',
        message: 'La información médica se guardó correctamente',
        color: 'green'
      });

      setFormState(prev => ({
        ...prev,
        savedSteps: new Set([...prev.savedSteps, 2])
      }));
    }

    return { success: true };
  } catch (error: any) {
    notifications.show({
      title: 'Error al guardar',
      message: error.message || 'Ocurrió un error al guardar los datos médicos',
      color: 'red'
    });
    return { success: false };
  } finally {
    setIsSubmitting(false);
  }
}, [mode, formData, formState]);
```

---

## 🏢 Paso 3 - Información Penitenciaria

### Servicio necesario:
- `penitentiaryService.ts`

### Validación requerida:
```typescript
if (step === 3) {
  if (!formData.penitentiary?.cell_block) {
    newErrors['penitentiary.cell_block'] = 'El bloque es requerido';
  }
  if (!formData.penitentiary?.cell_number) {
    newErrors['penitentiary.cell_number'] = 'El número de celda es requerido';
  }
  // ... otros campos penitenciarios
}
```

### Implementación:
```typescript
const savePenitentiaryStep = useCallback(async (): Promise<{ success: boolean }> => {
  try {
    setIsSubmitting(true);
    
    if (!formState.prisonerId) {
      throw new Error('No se ha creado el prisionero aún');
    }

    if (formData.penitentiary) {
      if (mode === 'create') {
        await penitentiaryService.createPenitentiary(formState.prisonerId, formData.penitentiary);
      } else {
        await penitentiaryService.updatePenitentiary(formState.prisonerId, formData.penitentiary);
      }

      notifications.show({
        title: 'Ubicación penitenciaria guardada',
        message: 'La información de ubicación se guardó correctamente',
        color: 'green'
      });

      setFormState(prev => ({
        ...prev,
        savedSteps: new Set([...prev.savedSteps, 3])
      }));
    }

    return { success: true };
  } catch (error: any) {
    notifications.show({
      title: 'Error al guardar',
      message: error.message || 'Ocurrió un error al guardar la ubicación',
      color: 'red'
    });
    return { success: false };
  } finally {
    setIsSubmitting(false);
  }
}, [mode, formData, formState]);
```

---

## 📞 Paso 4 - Contactos

### Servicio necesario:
- `contactsService.ts`

### Validación requerida:
```typescript
if (step === 4) {
  if (formData.contacts && formData.contacts.length > 0) {
    formData.contacts.forEach((contact, idx) => {
      if (!contact.name) {
        newErrors[`contacts.${idx}.name`] = 'El nombre es requerido';
      }
      if (!contact.phone) {
        newErrors[`contacts.${idx}.phone`] = 'El teléfono es requerido';
      }
      if (!contact.relationship) {
        newErrors[`contacts.${idx}.relationship`] = 'La relación es requerida';
      }
    });
  }
}
```

### Implementación:
```typescript
const saveContactsStep = useCallback(async (): Promise<{ success: boolean }> => {
  try {
    setIsSubmitting(true);
    
    if (!formState.prisonerId) {
      throw new Error('No se ha creado el prisionero aún');
    }

    if (formData.contacts && formData.contacts.length > 0) {
      for (const contact of formData.contacts) {
        if (mode === 'create') {
          await contactsService.createContact(formState.prisonerId, contact);
        } else if (contact.id) {
          await contactsService.updateContact(formState.prisonerId, contact.id, contact);
        } else {
          // Nuevo contacto en modo edición
          await contactsService.createContact(formState.prisonerId, contact);
        }
      }

      notifications.show({
        title: 'Contactos guardados',
        message: 'Los contactos se guardaron correctamente',
        color: 'green'
      });

      setFormState(prev => ({
        ...prev,
        savedSteps: new Set([...prev.savedSteps, 4])
      }));
    }

    return { success: true };
  } catch (error: any) {
    notifications.show({
      title: 'Error al guardar',
      message: error.message || 'Ocurrió un error al guardar los contactos',
      color: 'red'
    });
    return { success: false };
  } finally {
    setIsSubmitting(false);
  }
}, [mode, formData, formState]);
```

---

## ⚖️ Paso 5 - Información Legal (Último paso)

### Servicio necesario:
- `casesService.ts`
- `mandatesService.ts` (si aplica)

### Validación requerida:
```typescript
if (step === 5) {
  if (!formData.legal?.case_number) {
    newErrors['legal.case_number'] = 'El número de caso es requerido';
  }
  if (!formData.legal?.case_type) {
    newErrors['legal.case_type'] = 'El tipo de caso es requerido';
  }
  // ... otros campos legales
}
```

### Implementación:
```typescript
const saveLegalStep = useCallback(async (): Promise<{ success: boolean }> => {
  try {
    setIsSubmitting(true);
    
    if (!formState.prisonerId) {
      throw new Error('No se ha creado el prisionero aún');
    }

    if (formData.legal) {
      if (mode === 'create') {
        await casesService.createCase(formState.prisonerId, formData.legal);
      } else if (formData.legal.id) {
        await casesService.updateCase(formState.prisonerId, formData.legal.id, formData.legal);
      }

      notifications.show({
        title: 'Información legal guardada',
        message: 'Los datos legales se guardaron correctamente',
        color: 'green'
      });

      setFormState(prev => ({
        ...prev,
        savedSteps: new Set([...prev.savedSteps, 5])
      }));
    }

    return { success: true };
  } catch (error: any) {
    notifications.show({
      title: 'Error al guardar',
      message: error.message || 'Ocurrió un error al guardar la información legal',
      color: 'red'
    });
    return { success: false };
  } finally {
    setIsSubmitting(false);
  }
}, [mode, formData, formState]);
```

### Actualizar `handleSubmit`:
```typescript
const handleSubmit = useCallback(async () => {
  if (!formState.prisonerId) {
    notifications.show({
      title: 'Error',
      message: 'No se pudo completar el registro',
      color: 'red'
    });
    return;
  }

  // Validar paso actual
  const validation = validateStep(activeStep);
  if (!validation.isValid) {
    setErrors(validation.errors);
    return;
  }

  // Guardar el último paso
  const result = await saveLegalStep();
  if (!result.success) {
    return;
  }

  try {
    setIsSubmitting(true);

    notifications.show({
      title: 'Registro completado',
      message: 'El prisionero se registró exitosamente',
      color: 'green'
    });

    // Llamar callback de éxito
    if (formState.prisoner) {
      onSuccess?.({
        prisoner: formState.prisoner,
        id: formState.prisonerId
      });
    }
  } catch (error: any) {
    notifications.show({
      title: 'Error',
      message: error.message || 'Ocurrió un error al finalizar el registro',
      color: 'red'
    });
  } finally {
    setIsSubmitting(false);
  }
}, [activeStep, formState, onSuccess, validateStep, saveLegalStep]);
```

---

## 🔄 Modo Edición

### Cómo cargar datos existentes:

Cuando se abre el formulario en modo edición, debe:

1. **Cargar datos del prisionero**:
```typescript
// En el componente padre que usa PrisonerFormWizard
const [initialData, setInitialData] = useState<Partial<CreatePrisonerData>>();

useEffect(() => {
  if (mode === 'edit' && prisonerId) {
    loadPrisonerData(prisonerId);
  }
}, [mode, prisonerId]);

const loadPrisonerData = async (id: string) => {
  try {
    const [prisoner, identity, personal, medical, penitentiary, contacts, cases] = await Promise.all([
      prisonersService.getPrisoner(id),
      identityService.getIdentity(id),
      personalService.getPersonal(id),
      medicalRecordsService.getMedicalRecords(id),
      penitentiaryService.getPenitentiary(id),
      contactsService.getContacts(id),
      casesService.getCases(id)
    ]);

    setInitialData({
      ...prisoner,
      identity: identity ? { ...identity } : undefined,
      personal: personal ? { ...personal } : undefined,
      medical_record: medical.data || [],
      penitentiary: penitentiary ? { ...penitentiary } : undefined,
      contacts: contacts.data || [],
      legal: cases.data?.[0] || undefined
    });
  } catch (error) {
    console.error('Error loading prisoner data:', error);
  }
};
```

2. **Detectar cambios antes de guardar**:

En cada función `saveStepX`, puedes agregar lógica para comparar datos:

```typescript
// Ejemplo en modo edición - solo actualizar si hay cambios
if (mode === 'edit') {
  const hasChanges = JSON.stringify(formData.personal) !== JSON.stringify(initialData?.personal);
  
  if (hasChanges) {
    await personalService.updatePersonal(formState.prisonerId, formData.personal);
  } else {
    // No hay cambios, solo continuar
    return { success: true };
  }
}
```

---

## ✨ Mejoras Adicionales

### 1. Indicador visual de pasos guardados:

En `FormStepper.tsx`, puedes mostrar un checkmark para pasos ya guardados:

```typescript
{savedSteps.has(step.step) && <CheckIcon />}
```

### 2. Advertencia al salir:

```typescript
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (activeStep > 0 && activeStep < steps.length - 1) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [activeStep, steps.length]);
```

### 3. Botón "Guardar borrador":

Agregar un botón adicional para guardar sin avanzar:

```typescript
const handleSaveDraft = async () => {
  const validation = validateStep(activeStep);
  if (!validation.isValid) {
    setErrors(validation.errors);
    return;
  }

  // Llamar la función de guardado del paso actual
  switch (activeStep) {
    case 0:
      await saveBasicInfoStep();
      break;
    case 1:
      await savePersonalInfoStep();
      break;
    // ... etc
  }
};
```

---

## 📚 Servicios que necesitas verificar

Asegúrate de que todos estos servicios existen y tienen los métodos necesarios:

- ✅ `prisonersService.ts` - create, update
- ✅ `identityService.ts` - create, update, uploadPhoto, uploadFingerprint
- ❓ `personalService.ts` - create, update, get
- ❓ `belongingsService.ts` - create, update
- ❓ `childrenService.ts` - create, update
- ❓ `medicalRecordsService.ts` - create, update, get
- ❓ `penitentiaryService.ts` - create, update, get
- ❓ `contactsService.ts` - create, update, get
- ❓ `casesService.ts` - create, update, get
- ❓ `mandatesService.ts` - create, update (si aplica)

---

## 🎯 Checklist de Implementación

Para cada paso (1-5):

- [ ] Crear función `saveStepN` en `usePrisonerFormHandler.ts`
- [ ] Agregar validación en `validateStep`
- [ ] Agregar llamada en `handleNext`
- [ ] Verificar que los servicios existan y funcionen
- [ ] Probar en modo creación
- [ ] Probar en modo edición
- [ ] Manejar errores apropiadamente
- [ ] Mostrar notificaciones al usuario

---

## 🚀 Orden de Implementación Recomendado

1. **Paso 3 (Penitenciaria)** - Más simple, solo un objeto
2. **Paso 2 (Médico)** - Un solo registro médico
3. **Paso 4 (Contactos)** - Array de contactos
4. **Paso 1 (Personal)** - Múltiples entidades (personal, belonging, children)
5. **Paso 5 (Legal)** - Último paso, incluye finalización

---

¡Con esta guía deberías poder implementar el guardado progresivo para todos los pasos restantes siguiendo el mismo patrón que se usó en el Paso 0!
