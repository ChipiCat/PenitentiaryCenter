# 🔄 Guía de Migración

## Cambios en el Sistema de Formulario de Prisioneros

Esta guía te ayudará a migrar de la versión anterior a la nueva implementación con actualizaciones parciales.

---

## 📋 ¿Qué Cambió?

### Antes (Versión Anterior)
```typescript
// Solo había modo creación
<PrisonerFormWizard
  initialData={data}
  onSuccess={handleSuccess}
  onCancel={handleCancel}
/>
```

### Ahora (Nueva Versión)
```typescript
// Modo creación
<PrisonerFormWizard
  mode="create"
  initialData={data}
  onSuccess={handleSuccess}
  onCancel={handleCancel}
/>

// Modo edición (NUEVO)
<PrisonerFormWizard
  mode="edit"
  prisonerId="uuid-del-prisionero"
  initialData={prisonerData}
  onSuccess={handleSuccess}
  onCancel={handleCancel}
/>
```

---

## 🔧 Pasos para Migrar

### 1. Actualizar Imports

**Antes:**
```typescript
import { PrisonerFormWizard } from './PrisonerFormWizard';
```

**Ahora:**
```typescript
import { PrisonerFormWizard } from './PrisonerFormWizard';
// No cambia, pero ahora soporta modo edición
```

### 2. Añadir Prop `mode`

**Antes:**
```typescript
<PrisonerFormWizard
  initialData={formData}
  onSuccess={handleSuccess}
/>
```

**Ahora (explícitamente especificar modo):**
```typescript
<PrisonerFormWizard
  mode="create"  // ← AÑADIR ESTA LÍNEA
  initialData={formData}
  onSuccess={handleSuccess}
/>
```

### 3. Implementar Modo Edición

**Nuevo código para editar prisioneros:**
```typescript
const EditPrisonerPage = ({ prisonerId }: { prisonerId: string }) => {
  const [prisonerData, setPrisonerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar datos del prisionero
    const loadData = async () => {
      try {
        const data = await prisonersService.getPrisoner(prisonerId);
        setPrisonerData(data);
      } catch (error) {
        console.error('Error al cargar prisionero:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [prisonerId]);

  if (loading) return <Loading />;
  if (!prisonerData) return <Error />;

  return (
    <PrisonerFormWizard
      mode="edit"
      prisonerId={prisonerId}
      initialData={prisonerData}
      onSuccess={(result) => {
        console.log('Prisionero actualizado:', result);
        navigate(`/prisoners/${result.id}`);
      }}
      onCancel={() => {
        navigate(`/prisoners/${prisonerId}`);
      }}
    />
  );
};
```

---

## 📝 Interfaces Actualizadas

### UpdateIdentityData
```typescript
// NUEVO campo añadido
interface UpdateIdentityData {
  surname?: string;
  first_name?: string;
  birth_date?: string;
  birth_place?: string;
  residence?: string;
  citizenship_type?: string;
  country_of_origin?: string;
  nationality_type?: string;  // ← NUEVO
  nationality?: string;
}
```

### UpdatePersonalData
```typescript
// NUEVOS campos añadidos
interface UpdatePersonalData {
  gender?: string;              // ← NUEVO
  father_name?: string;         // ← NUEVO
  mother_name?: string;         // ← NUEVO
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
// Interfaz completamente rediseñada
interface UpdateCaseData {
  case_number?: string;
  crime?: string;              // ← Renombrado (antes: case_type)
  status?: string;
  start_date?: string;
  end_date?: string;
  court_name?: string;         // ← Renombrado (antes: court)
  judge_name?: string;         // ← Renombrado (antes: judge)
  sentence_years?: number;     // ← NUEVO
  remarks?: string;            // ← NUEVO (antes: description)
}
```

### UpdateMandateData
```typescript
// Interfaz corregida
interface UpdateMandateData {
  type?: 'Detencion' | 'Condena' | 'Libertad' | 'Apelacion' | 'Traslado';
  issue_date?: string;
  description?: string;
  status?: 'Vigente' | 'Ejecutado' | 'Anulado';
}
```

---

## 🚨 Breaking Changes

### 1. Prop `mode` es Opcional pero Recomendada
- **Antes:** No existía
- **Ahora:** Se recomienda especificar explícitamente
- **Default:** `"create"` si no se especifica

### 2. Campos de Casos Renombrados
Si estás usando casos directamente:

```typescript
// ANTES
{
  case_type: "Robo",
  court: "Juzgado 1",
  judge: "Juan Pérez",
  description: "Nota"
}

// AHORA
{
  crime: "Robo",
  court_name: "Juzgado 1",
  judge_name: "Juan Pérez",
  remarks: "Nota",
  sentence_years: 5  // NUEVO campo requerido
}
```

### 3. Callback `onSuccess` Recibe Datos Diferentes
```typescript
// ANTES
onSuccess: (prisoner: PrisonerBase) => void

// AHORA
onSuccess: (result: { prisoner: PrisonerBase; id: string }) => void
```

**Migración:**
```typescript
// ANTES
onSuccess={(prisoner) => {
  console.log('ID:', prisoner.id);
}}

// AHORA
onSuccess={(result) => {
  console.log('ID:', result.id);
  console.log('Prisionero:', result.prisoner);
}}
```

---

## ✅ Compatibilidad Hacia Atrás

El código **ES compatible** hacia atrás si:
- No especificas `mode` (defaultea a `"create"`)
- No usas las nuevas interfaces de Update directamente
- Solo usas el modo creación

**Ejemplo de código que sigue funcionando sin cambios:**
```typescript
<PrisonerFormWizard
  initialData={data}
  onSuccess={handleSuccess}
  onCancel={handleCancel}
/>
// ✅ Funciona (modo "create" por defecto)
```

---

## 🔍 Checklist de Migración

### Para Mantener Funcionamiento Actual
- [ ] Verificar que todos los usos de `<PrisonerFormWizard>` sigan compilando
- [ ] Probar flujo de creación existente
- [ ] No requiere cambios de código

### Para Añadir Modo Edición
- [ ] Añadir prop `mode="edit"`
- [ ] Añadir prop `prisonerId`
- [ ] Cargar `initialData` del backend
- [ ] Actualizar handler `onSuccess` para manejar nuevo formato
- [ ] Probar actualización parcial

### Para Actualizar Interfaces
- [ ] Revisar uso de `UpdateCaseData`
- [ ] Añadir campo `nationality_type` en identidad
- [ ] Añadir campos `gender`, `father_name`, `mother_name` en personal
- [ ] Actualizar tests si existen

---

## 📚 Recursos Adicionales

- **Documentación completa:** `README_PARTIAL_UPDATES.md`
- **Ejemplos de uso:** `USAGE_EXAMPLES.tsx`
- **Resumen de implementación:** `IMPLEMENTATION_SUMMARY.md`

---

## 🆘 Problemas Comunes

### Error: "mode is required"
**Solución:** Añade `mode="create"` o `mode="edit"`

### Error: "prisonerId is required in edit mode"
**Solución:** En modo edición, siempre debes pasar el `prisonerId`

### Los cambios no se guardan
**Verificar:**
1. ¿Estás en modo `"edit"`?
2. ¿Pasaste `prisonerId`?
3. ¿Los datos `initialData` están correctamente cargados?
4. ¿Modificaste algo antes de guardar?

### Actualización parcial no funciona
**Debug:**
```typescript
// Añade esto temporalmente para ver qué se detecta
console.log('Dirty state:', dirtyState);
```

---

## 💡 Tips de Migración

### 1. Migra Gradualmente
No es necesario migrar todo a la vez. El modo creación sigue funcionando como antes.

### 2. Prueba en Desarrollo Primero
Prueba el modo edición en un ambiente de desarrollo antes de desplegar.

### 3. Mantén Backup
Guarda una copia del código anterior por si acaso:
```bash
cp usePrisonerFormHandler.ts usePrisonerFormHandler.backup.ts
```

### 4. Revisa Logs
El nuevo sistema registra información útil en console para debugging:
```typescript
console.log('[usePrisonerFormHandler] Error en handleSubmit:', error);
```

---

## 🎉 Beneficios Después de Migrar

1. ✅ **Edición de prisioneros** sin recrear todo
2. ✅ **Performance mejorado** con actualizaciones parciales
3. ✅ **Mejor UX** con feedback detallado
4. ✅ **Código más mantenible** y profesional
5. ✅ **Fácil de extender** con nuevas secciones

---

¿Dudas? Consulta la documentación completa o revisa los ejemplos de uso.
