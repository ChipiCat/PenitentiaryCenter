# Módulo de Auditoría - Sistema de Registro de Actividades

## 📋 Descripción

Sistema completo de auditoría que registra **actividades**, **sesiones** y **cambios a nivel de campo** en la base de datos.

## 🗂️ Estructura de Tablas

### 1. **ActivityLog** (activity_logs)
Registra acciones realizadas en el sistema.

**Campos principales:**
- `userId`, `userEmail`, `userName`, `userRole` - Quién realizó la acción
- `action` - Tipo de acción (LOGIN, USER_UPDATED, etc.)
- `entityType` - Tipo de entidad afectada (USER, PRISONER, etc.)
- `entityId` - ID de la entidad afectada
- `timestamp` - Cuándo ocurrió
- `ipAddress`, `userAgent` - Desde dónde
- `description` - Descripción legible
- `metadata` - Datos adicionales (JSON)
- `status` - SUCCESS, FAILED, etc.
- `module` - Módulo del sistema (AUTH, USERS, etc.)
- `severity` - INFO, WARNING, ERROR, CRITICAL
- `sessionLogId` - Relación con sesión (opcional)

### 2. **SessionLog** (session_logs)
Registra sesiones de usuario (login/logout).

**Campos principales:**
- `userId` - Usuario de la sesión
- `loginAt` - Timestamp de login
- `logoutAt` - Timestamp de logout
- `ipAddress`, `userAgent` - Información del cliente
- `deviceInfo`, `country`, `city` - Contexto adicional
- `isActive` - Si la sesión está activa
- `logoutReason` - Razón del cierre de sesión

### 3. **DataChangeLog** (data_change_logs) ✨ NUEVA
Registra **cambios a nivel de campo** para auditoría detallada.

**Campos principales:**
- `activityLogId` - Relacionado con ActivityLog
- `entityType` - Tipo de entidad (USER, PRISONER, etc.)
- `entityId` - ID de la entidad
- `fieldName` - Nombre del campo que cambió
- `oldValue` - Valor anterior
- `newValue` - Valor nuevo
- `changedBy` - Quién hizo el cambio
- `changedAt` - Cuándo se hizo el cambio
- `reason` - Razón del cambio (opcional)

## 🔧 Métodos Disponibles en AuditService

### ActivityLog Methods

```typescript
// Método genérico para registrar actividades
await auditService.logActivity(dto: CreateActivityLogDto): Promise<ActivityLog>

// Métodos específicos para autenticación
await auditService.logLogin(userId, userEmail, userName, userRole, ipAddress?, userAgent?, sessionLogId?)
await auditService.logLoginFailed(email, reason, ipAddress?, userAgent?)
await auditService.logLogout(userId, userEmail, userName, userRole, logoutReason, ipAddress?, userAgent?, sessionLogId?)
await auditService.logTokenRefresh(userId, userEmail, userName, userRole, ipAddress?, userAgent?)

// Métodos específicos para usuarios (sin DataChangeLog)
await auditService.logUserCreated(...)
await auditService.logUserDeleted(...)

// Obtener logs con filtros y paginación
await auditService.getActivityLogs(filters)
```

### SessionLog Methods

```typescript
// Crear sesión al hacer login
await auditService.createSession(dto: CreateSessionLogDto): Promise<SessionLog>

// Actualizar sesión al hacer logout
await auditService.updateSession(sessionId, dto: UpdateSessionLogDto): Promise<SessionLog>

// Obtener sesión activa de un usuario
await auditService.getActiveSession(userId): Promise<SessionLog | null>

// Cerrar todas las sesiones de un usuario
await auditService.closeAllUserSessions(userId, logoutReason): Promise<number>

// Obtener sesiones con filtros
await auditService.getSessionLogs(filters)
```

### DataChangeLog Methods ✨ NUEVO

```typescript
// Registrar un solo cambio de campo
await auditService.logDataChange(dto: CreateDataChangeLogDto): Promise<DataChangeLog>

// Registrar múltiples cambios en una transacción
await auditService.logDataChanges(dtos: CreateDataChangeLogDto[]): Promise<DataChangeLog[]>

// Registrar actualización de usuario CON cambios a nivel de campo
await auditService.logUserUpdatedWithChanges(
  updatedUserId,
  updatedUserEmail,
  updatedUserName,
  updatedByUserId,
  updatedByUserEmail?,
  updatedByUserName?,
  updatedByUserRole?,
  fieldChanges?: Array<{
    field_name: string;
    old_value?: string;
    new_value?: string;
  }>,
  ipAddress?,
  userAgent?
): Promise<{ activityLog: ActivityLog; dataChanges: DataChangeLog[] }>

// Obtener cambios con filtros
await auditService.getDataChangeLogs(filters)

// Obtener historial de cambios de una entidad específica
await auditService.getEntityChangeHistory(entityType, entityId, fieldName?)
```

## 📝 Ejemplo de Uso: Actualización de Usuario

### Antes (sin DataChangeLog)
```typescript
// Solo registraba en ActivityLog con metadata
await auditService.logUserUpdated(
  userId, 
  email, 
  name, 
  updatedBy,
  ...,
  { name: { old: 'John', new: 'Jane' } } // metadata
)
```

### Ahora (con DataChangeLog) ✨
```typescript
// En UserService.update():
const fieldChanges = [];

if (name !== existingUser.name) {
  fieldChanges.push({
    field_name: 'name',
    old_value: existingUser.name,
    new_value: name,
  });
}

if (email !== existingUser.email) {
  fieldChanges.push({
    field_name: 'email',
    old_value: existingUser.email,
    new_value: email,
  });
}

// Crea 1 ActivityLog + N DataChangeLogs (uno por campo)
await auditService.logUserUpdatedWithChanges(
  user.id,
  user.email,
  user.name,
  updatedBy,
  updaterEmail,
  updaterName,
  updaterRole,
  fieldChanges, // Array de cambios
  ipAddress,
  userAgent
);
```

### Resultado en Base de Datos

**activity_logs:**
```
id: "abc123"
action: USER_UPDATED
entityType: USER
entityId: "user-456"
description: "User jane@example.com (Jane Doe) was updated"
userId: "admin-789"
...
```

**data_change_logs:**
```
id: "change-1"
activityLogId: "abc123"  ← Relacionado con ActivityLog
entityType: USER
entityId: "user-456"
fieldName: "name"
oldValue: "John Doe"
newValue: "Jane Doe"
changedBy: "admin-789"
changedAt: 2025-10-20T10:30:00Z

id: "change-2"
activityLogId: "abc123"  ← Mismo ActivityLog
entityType: USER
entityId: "user-456"
fieldName: "email"
oldValue: "john@example.com"
newValue: "jane@example.com"
changedBy: "admin-789"
changedAt: 2025-10-20T10:30:00Z
```

## 🔍 Consultas Útiles

### Ver historial completo de cambios de un usuario
```typescript
const history = await auditService.getEntityChangeHistory(
  EntityType.USER,
  'user-456'
);

// Retorna todos los DataChangeLogs con ActivityLog incluido
```

### Ver cambios de un campo específico
```typescript
const emailChanges = await auditService.getEntityChangeHistory(
  EntityType.USER,
  'user-456',
  'email'  // Solo cambios del campo email
);
```

### Ver cambios de una actividad específica
```typescript
const changes = await auditService.getDataChangeLogs({
  activity_log_id: 'abc123'
});
// Retorna todos los cambios de esa actividad
```

### Ver todos los cambios hechos por un usuario
```typescript
const changes = await auditService.getDataChangeLogs({
  changed_by: 'admin-789',
  page: 1,
  size: 20
});
```

## 🎯 Ventajas del Sistema

### Con DataChangeLog (Implementado)
✅ **Auditoría granular**: Cada campo tiene su propio registro  
✅ **Historial completo**: Puedes ver todos los cambios de un campo en el tiempo  
✅ **Consultas específicas**: Filtrar por campo, usuario, entidad  
✅ **Normalizado**: Datos estructurados, no JSON anidado  
✅ **Relacional**: Vinculado con ActivityLog para contexto completo  
✅ **Escalable**: Fácil agregar nuevas entidades y campos  

### Sin DataChangeLog (Antes)
❌ Cambios guardados solo en metadata (JSON)  
❌ Difícil consultar cambios específicos de un campo  
❌ No estructurado ni normalizado  
❌ Complicado generar reportes de auditoría  

## 🚀 Flujo Completo: Actualización de Usuario

```
1. Usuario admin actualiza nombre y email de Jane
   ↓
2. UserService.update() detecta cambios
   ↓
3. Crea array de fieldChanges:
   [
     { field_name: 'name', old_value: 'John', new_value: 'Jane' },
     { field_name: 'email', old_value: 'john@', new_value: 'jane@' }
   ]
   ↓
4. Llama auditService.logUserUpdatedWithChanges()
   ↓
5. Crea 1 ActivityLog (USER_UPDATED)
   ↓
6. Crea 2 DataChangeLogs (uno por campo) en transacción
   ↓
7. Ambos DataChangeLogs tienen activityLogId vinculado
```

## 📊 Reportes Posibles

Con este sistema puedes generar reportes como:

- **Auditoría de usuario**: Todos los cambios hechos a un usuario específico
- **Auditoría por campo**: Historial de cambios de un campo específico (ej: email)
- **Auditoría por admin**: Todos los cambios hechos por un administrador
- **Auditoría por fecha**: Cambios en un rango de fechas
- **Cambios sospechosos**: Múltiples cambios en poco tiempo
- **Compliance**: Exportar todos los cambios para auditoría externa

## 🔐 Seguridad y Compliance

Este sistema cumple con:
- ✅ **GDPR**: Registro de cambios de datos personales
- ✅ **SOC 2**: Trazabilidad de acciones
- ✅ **ISO 27001**: Gestión de logs de seguridad
- ✅ **Auditoría forense**: Reconstrucción de eventos
