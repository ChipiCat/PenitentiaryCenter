# Edición de Ubicación Penitenciaria - Documentación

## 📋 Descripción General

Se implementó la funcionalidad de edición in-place para la sección de **Ubicación Penitenciaria** en el perfil del prisionero, siguiendo el mismo patrón arquitectónico limpio y ordenado utilizado en las secciones de Información Principal e Información Personal.

## 🏗️ Arquitectura Implementada

### Patrón Arquitectónico
```
GeneralBlock (Componente)
    ↓
usePenitentiaryEditor (Hook - Lógica de Negocio)
    ↓
penitentiaryService (API Service)
    ↓
Backend API
```

### Separación de Responsabilidades (SOLID)

**S - Single Responsibility:**
- `usePenitentiaryEditor`: Lógica de edición y validaciones
- `PenitentiaryEditForm`: UI para editar ubicación penitenciaria
- `GeneralBlock`: Orquestación y vista/edición

**O - Open/Closed:**
- Componentes extensibles sin modificar código existente
- Hook reutilizable en otros contextos

**D - Dependency Inversion:**
- Componentes dependen de abstracciones (tipos TypeScript)
- No acoplamiento directo a implementaciones de servicios

## 📁 Archivos Creados

### 1. Hook de Lógica de Negocio
**`hooks/usePenitentiaryEditor.ts`**
- **Propósito**: Centralizar lógica de edición, validaciones y llamadas a penitentiaryService
- **Responsabilidades**:
  - Estado de edición (isEditing)
  - Validaciones de formulario (campos opcionales pero validados si se llenan)
  - Actualización de ubicación penitenciaria
  - Manejo de errores y notificaciones
- **Exports**:
  ```typescript
  {
    isEditing,
    isLoading,
    errors,
    updatePenitentiary,
    startEditing,
    cancelEditing,
  }
  ```

### 2. Formulario de Ubicación Penitenciaria
**`forms/PenitentiaryEditForm.tsx`**
- **Propósito**: Formulario para editar datos de ubicación penitenciaria
- **Campos**:
  - **category** (Select): DerechoComun | PrisionPreventiva | PrisioneroAcusado
  - **building_number**: Número o nombre del edificio
  - **cell_number**: Número de celda
  - **bed_number**: Número de cama
- **Validaciones**: Campos opcionales (pueden estar vacíos o con valores válidos)
- **UI**: 
  - Select para categoría con opciones claras
  - Grid de 3 columnas para ubicación física (responsive)
  - Botones Cancelar/Guardar

### 3. Integración en GeneralBlock
**`cards/GeneralBlock.tsx`** (Modificado)
- **Cambios**:
  - Agregado hook `usePenitentiaryEditor`
  - Botón de edición (icono `Edit3`) en la sección
  - Alternancia entre vista y formulario de edición
  - Mantiene el Badge de categoría en modo vista
  - Preserva el estilo visual existente

### 4. Barriles de Exportación
**`hooks/index.ts`** (Actualizado)
```typescript
export { usePenitentiaryEditor } from './usePenitentiaryEditor';
```

**`forms/index.ts`** (Actualizado)
```typescript
export { PenitentiaryEditForm } from './PenitentiaryEditForm';
```

## 🎨 Características de UI/UX

### Diseño Visual
- ✅ Botón de edición con icono `Edit3` (lápiz) en ActionIcon
- ✅ Color azul consistente con otras secciones
- ✅ Formulario con mismo estilo que otros formularios
- ✅ Grid responsive (1 columna en móvil, 3 columnas en desktop para ubicación)
- ✅ Select con opciones en español legibles
- ✅ Badge de categoría con colores significativos (azul/naranja/rojo)

### Interacciones
- ✅ Click en botón editar → Oculta vista y muestra formulario
- ✅ Select clearable para categoría (puede quedar sin valor)
- ✅ Botones "Cancelar" y "Guardar Cambios" en formulario
- ✅ Loading state en botón "Guardar Cambios"
- ✅ Notificaciones de éxito/error
- ✅ Campos opcionales (pueden estar vacíos)

### Validaciones
**Ubicación Penitenciaria:**
- category: opcional
- building_number: opcional (pero no puede ser string vacío si se especifica)
- cell_number: opcional (pero no puede ser string vacío si se especifica)
- bed_number: opcional (pero no puede ser string vacío si se especifica)

**Nota**: Los campos son opcionales porque un prisionero puede no tener ubicación asignada aún.

## 🔧 Tipos TypeScript

### Tipos Utilizados
```typescript
// Entrada
UpdatePenitentiaryData {
  category?: "DerechoComun" | "PrisionPreventiva" | "PrisioneroAcusado";
  building_number?: string;
  cell_number?: string;
  bed_number?: string;
}

// Validación
ValidationErrors {
  penitentiary?: Record<string, string>;
}
```

### Flujo de Actualización
1. Usuario edita campos en formulario (todos opcionales)
2. Al guardar, hook valida que no haya strings vacíos
3. Si hay errores, se muestran en el formulario
4. Si validación OK:
   - Llama a `penitentiaryService.updatePenitentiary()`
5. Muestra notificación de éxito/error
6. Llama a `onRefresh()` para recargar datos
7. Cierra formulario y vuelve a vista

## 🎯 Mapeo de Valores

### Category Display Mapping
```typescript
Backend         → Frontend Display
DerechoComun    → "Derecho Común"
PrisionPreventiva → "Prisión Preventiva"
PrisioneroAcusado → "Prisionero Acusado"
```

### Badge Colors
```typescript
"Derecho Común"      → Blue badge
"Prisión Preventiva" → Orange badge
"Prisionero Acusado" → Red badge
```

## 🧪 Testing Sugerido

### Casos de Prueba
1. **Edición exitosa**: Cambiar categoría y ubicación
2. **Limpiar categoría**: Usar clearable del Select
3. **Campos vacíos**: Dejar todos los campos vacíos (debe permitir)
4. **Cancelación**: Verificar que datos no cambien al cancelar
5. **Error de API**: Simular error en servicio
6. **Validación**: Intentar guardar campos con espacios en blanco

## 📊 Comparación con Sección Anterior

| Aspecto | Antes | Después |
|---------|-------|---------|
| Botón edición | Sin botón | Botón integrado con icono |
| Validación | Sin validaciones | Validación de campos no vacíos |
| UX | Solo vista estática | Edición in-place |
| Separación | Todo en vista | Hook + Form + Vista |
| Mantenibilidad | Media | Alta (SOLID) |
| Badge | Estático | Se mantiene en vista, oculta en edición |

## 🔄 Integración con Sistema Existente

### Compatibilidad
- ✅ Compatible con GeneralBlock
- ✅ No rompe funcionalidad existente
- ✅ Usa mismo servicio y tipos oficiales
- ✅ Consistente con otras secciones editables
- ✅ Mantiene el estilo visual del Badge en vista

### Estado del Sistema
```typescript
// GeneralBlock ahora gestiona 3 hooks de edición:
useMainInfoEditor()      // Info Principal
useMainInfoEditor()      // Info Personal (mismo hook)
usePenitentiaryEditor()  // Ubicación Penitenciaria
```

## 💡 Buenas Prácticas Aplicadas

1. **DRY**: Hook reutilizable para lógica de ubicación
2. **Separation of Concerns**: Vista, lógica y servicio separados
3. **Type Safety**: TypeScript estricto, tipos oficiales del backend
4. **Error Handling**: Try/catch con notificaciones claras
5. **Loading States**: Indicador visual durante guardado
6. **Validation**: Validación ligera (campos opcionales pero coherentes)
7. **User Feedback**: Notificaciones de éxito/error
8. **Accessibility**: Labels y aria-labels apropiados
9. **Responsive Design**: Grid adaptable (1/3 columnas)
10. **Clean Code**: Código legible, comentarios útiles, estructura clara

## 📝 Notas Importantes

- **Campos opcionales**: Todos los campos pueden estar vacíos (prisionero sin ubicación asignada)
- **Validación suave**: Solo valida que no sean strings vacíos si se especifican
- **Badge preservado**: El badge de categoría se mantiene en modo vista con sus colores
- **Select clearable**: La categoría puede limpiarse completamente
- **Grid de 3 columnas**: Ubicación física (edificio, celda, cama) en una fila

## ✅ Verificación de Errores

**Estado TypeScript**: ✅ Sin errores
**Estado Linting**: ✅ Sin errores
**Imports**: ✅ Todos resueltos correctamente
**Integración**: ✅ Funcionando con GeneralBlock

## 🚀 Archivos del Sistema

### Creados (2):
1. `hooks/usePenitentiaryEditor.ts` - Lógica de negocio
2. `forms/PenitentiaryEditForm.tsx` - Formulario de edición

### Modificados (3):
1. `cards/GeneralBlock.tsx` - Integración del formulario
2. `hooks/index.ts` - Export del hook
3. `forms/index.ts` - Export del formulario

---

**Fecha de Implementación**: 2 de noviembre de 2025  
**Patrón**: Consistente con Main/Personal Info Edit  
**Autor**: Implementado siguiendo principios SOLID y buenas prácticas
