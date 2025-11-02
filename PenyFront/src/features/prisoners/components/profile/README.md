# 🎯 Sistema de Gestión de Perfiles de Prisioneros

## 📁 Estructura del Proyecto

```
features/prisoners/components/profile/
├── sections/              # Componentes de sección (UI principal)
│   ├── ChildrenSection.tsx
│   ├── BelongingsSection.tsx
│   └── ContactsSection.tsx
├── modals/                # Formularios modales
│   ├── ChildFormModal.tsx
│   ├── BelongingFormModal.tsx
│   └── ContactFormModal.tsx
├── hooks/                 # Lógica de negocio reutilizable
│   ├── useChildrenManager.ts
│   ├── useBelongingsManager.ts
│   └── useContactsManager.ts
└── cards/
    └── GeneralBlock.tsx   # Componente principal actualizado
```

---

## ✨ Características Implementadas

### **1. Sección de Hijos (ChildrenSection)**
- ✅ Visualización en cards con información clara
- ✅ Crear nuevos hijos
- ✅ Editar hijos existentes
- ✅ Eliminar con confirmación
- ✅ Formato de fechas en español
- ✅ Contador de hijos

### **2. Sección de Pertenencias (BelongingsSection)**
- ✅ Visualización con estado (devuelto/en custodia)
- ✅ Crear con descripción, cantidad y condición
- ✅ Editar pertenencias existentes
- ✅ **Subir archivos de inventario** (PDF, imágenes)
- ✅ **Actualizar archivos** (mismo endpoint para crear/editar)
- ✅ Ver archivos adjuntos
- ✅ Marcar como devuelto
- ✅ Eliminar con confirmación

### **3. Sección de Contactos (ContactsSection)**
- ✅ Visualización con información completa
- ✅ Crear con validación (nombre, relación, teléfono requeridos)
- ✅ Editar contactos con campos opcionales (email, dirección)
- ✅ Marcar como emergencia
- ✅ Iconos para teléfono, email, dirección
- ✅ Eliminar con confirmación

---

## 🏗️ Arquitectura y Mejores Prácticas

### **Principios Aplicados**

1. **Single Responsibility Principle (SRP)**
   - Cada componente tiene una única responsabilidad
   - Hooks separados para lógica de negocio
   - Modales independientes para formularios

2. **Separation of Concerns (SoC)**
   - **Sections**: Manejo de UI y estado local
   - **Modals**: Formularios y validación
   - **Hooks**: Operaciones CRUD y notificaciones
   - **Services**: Llamadas HTTP

3. **Don't Repeat Yourself (DRY)**
   - Patrón consistente en todos los componentes
   - Hooks reutilizables
   - Tipos compartidos

4. **Type Safety**
   - TypeScript estricto en toda la aplicación
   - Interfaces bien definidas
   - Sin uso de `any`

---

## 📝 Flujo de Archivos en Pertenencias

### **Creación**
```typescript
1. Usuario rellena formulario + selecciona archivo
2. POST /prisoners/{prisonerId}/belongings (crea registro)
3. Si hay archivo: POST /prisoners/{prisonerId}/belongings/{belongingId}/upload
4. Notificación de éxito
5. Actualizar lista
```

### **Edición (actualizar archivo)**
```typescript
1. Usuario edita datos + selecciona nuevo archivo
2. PUT /prisoners/{prisonerId}/belongings/{belongingId} (actualiza datos)
3. Si hay nuevo archivo: POST /prisoners/{prisonerId}/belongings/{belongingId}/upload (REEMPLAZA)
4. Notificación de éxito
5. Actualizar lista
```

### **Visualización**
```typescript
- Si existe attachment_url: Botón "Ver archivo"
- Click abre en nueva pestaña
```

---

## 🔧 Uso de los Componentes

### **Integración en GeneralBlock**

```tsx
import { ChildrenSection } from '../sections/ChildrenSection';
import { BelongingsSection } from '../sections/BelongingsSection';
import { ContactsSection } from '../sections/ContactsSection';

export const GeneralBlock: React.FC<GeneralBlockProps> = ({
  profile,
  onEdit,
  onRefresh, // ✅ Nuevo callback para actualizar perfil
}) => (
  <Stack gap="lg">
    {/* Información principal y personal */}
    <Card>{/* ... */}</Card>

    {/* Secciones nuevas */}
    <ChildrenSection
      prisonerId={profile.prisoner.id}
      children={profile.children}
      onUpdate={() => onRefresh?.()}
    />

    <BelongingsSection
      prisonerId={profile.prisoner.id}
      belongings={profile.belongings}
      onUpdate={() => onRefresh?.()}
    />

    <ContactsSection
      prisonerId={profile.prisoner.id}
      contacts={profile.contacts}
      onUpdate={() => onRefresh?.()}
    />
  </Stack>
);
```

### **Hooks Personalizados**

```typescript
// useChildrenManager.ts
const { deleteChild, isDeleting } = useChildrenManager(prisonerId, onUpdate);

// useBelongingsManager.ts
const { deleteBelonging, markAsReturned, isDeleting, isUpdating } = 
  useBelongingsManager(prisonerId, onUpdate);

// useContactsManager.ts
const { deleteContact, isDeleting } = useContactsManager(prisonerId, onUpdate);
```

---

## 🎨 Estilos y UI

### **Mantine UI Componentes Usados**
- `Card` - Contenedores principales
- `Stack` - Layout vertical
- `Group` - Layout horizontal
- `Button` - Acciones
- `ActionIcon` - Iconos clickeables
- `Badge` - Estados y contadores
- `Modal` - Diálogos
- `TextInputField` - Inputs de texto
- `NumberInput` - Inputs numéricos
- `DatePickerInput` - Selector de fechas
- `Switch` - Toggle para emergencia
- `Tooltip` - Información adicional

### **Lucide React Icons**
- `User` - Hijos y contactos
- `FileDown` - Pertenencias
- `Plus` - Agregar
- `Pencil` - Editar
- `Trash2` - Eliminar
- `Calendar` - Fechas
- `Phone`, `Mail`, `MapPin` - Info de contacto
- `CheckCircle2`, `XCircle` - Estados
- `Eye` - Ver archivos

### **Tailwind CSS**
- `hover:shadow-md transition-shadow` - Hover effects
- `text-{color}-600` - Colores de iconos
- Clases de utilidad para espaciado

---

## 📊 Validaciones

### **Hijos**
- ✅ Nombre completo requerido
- ✅ Fecha de nacimiento opcional (máximo hoy)

### **Pertenencias**
- ✅ Descripción requerida
- ✅ Cantidad > 0
- ✅ Condición opcional
- ✅ Archivo opcional (PDF, imágenes)

### **Contactos**
- ✅ Nombre requerido
- ✅ Relación requerida
- ✅ Teléfono requerido
- ✅ Email opcional (validación de formato)
- ✅ Dirección opcional
- ✅ is_emergency opcional (solo en edición)

---

## 🚀 Mejoras Futuras Sugeridas

1. **Paginación** - Para listas largas de elementos
2. **Búsqueda/Filtrado** - Buscar por nombre, relación, etc.
3. **Ordenamiento** - Por fecha, nombre, etc.
4. **Bulk Actions** - Eliminar múltiples items
5. **Drag & Drop** - Para subir archivos
6. **Preview de archivos** - Mostrar preview de imágenes/PDFs
7. **Historial de cambios** - Auditoría de modificaciones
8. **Export/Import** - CSV, Excel
9. **Validaciones avanzadas** - Regex para teléfonos, emails
10. **Confirmaciones más inteligentes** - Con undo/redo

---

## 🧪 Testing Sugerido

```typescript
// Ejemplo de test para ChildrenSection
describe('ChildrenSection', () => {
  it('should display children list', () => {});
  it('should open modal on add button click', () => {});
  it('should call onUpdate after successful creation', () => {});
  it('should show confirmation modal on delete', () => {});
});
```

---

## 📚 Referencias

- **Mantine UI**: https://mantine.dev/
- **Lucide React**: https://lucide.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **React Best Practices**: https://react.dev/learn

---

**Desarrollado siguiendo principios SOLID y Clean Code**  
**TypeScript Strict Mode ✅**  
**100% Tipado ✅**  
**Sin console.logs en producción ✅**
