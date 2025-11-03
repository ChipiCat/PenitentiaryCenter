# Changelog de Implementación - Módulo de Usuario y Autenticación

## Fecha: 3 de noviembre de 2025

## Resumen
Se implementaron mejoras significativas en los módulos de Usuario y Autenticación para soportar fotos de perfil mediante archivos y el manejo del primer inicio de sesión.

---

## 🎯 Cambios Implementados

### 1. **Actualización del Esquema de Base de Datos**

#### Modelo User
- ✅ **Eliminado**: Campo `photoUrl` (String)
- ✅ **Agregado**: Campo `photoFileId` (String?, unique) - Relación con tabla Files
- ✅ **Agregado**: Campo `isFirstLogin` (Boolean, default: true)
- ✅ **Agregado**: Relación `photoFile` con modelo `File`

---

### 2. **DTOs Actualizados**

#### `user.dto.ts`
- ✅ Agregado `FileResponseDto` para respuestas de archivos
- ✅ `CreateUserDto`: Campo `photoFileId` (opcional)
- ✅ `UpdateUserDto`: Campos `photoFileId` e `isFirstLogin` (opcionales)
- ✅ `UserResponseDto`: 
  - Campo `photoFile` (FileResponseDto | null) en lugar de `photoUrl`
  - Campo `isFirstLogin` (boolean)

#### `auth.dto.ts`
- ✅ `RegisterDto`: Eliminado campo `photoUrl` (el archivo se maneja con multipart/form-data)
- ✅ Agregado `ChangePasswordDto` con validaciones:
  - `currentPassword` (mínimo 6 caracteres)
  - `newPassword` (mínimo 6 caracteres)
- ✅ `AuthResponseDto`: Actualizado objeto `user` con `photoFile` e `isFirstLogin`

---

### 3. **Servicios Actualizados**

#### `UserService`
- ✅ Método `create()`: 
  - Maneja `photoFileId` en lugar de `photoUrl`
  - Incluye relación `photoFile` en las consultas
- ✅ Método `findAll()`: Incluye `photoFile` en las respuestas
- ✅ Método `findOne()`: Incluye `photoFile` en las respuestas
- ✅ Método `update()`: 
  - Soporte para actualizar `photoFileId` e `isFirstLogin`
  - Registra cambios en auditoría
- ✅ **Nuevo**: Método `changePassword()`:
  - Verifica contraseña actual
  - Valida que la nueva contraseña sea diferente
  - Actualiza hash de contraseña
  - Registra evento en auditoría

#### `AuthService`
- ✅ Inyección de `FilesService` para manejo de archivos
- ✅ Método `register()`:
  - Acepta archivo `photoFile` opcional
  - Sube foto usando `FilesService`
  - Vincula archivo con usuario mediante `photoFileId`
  - Retorna `photoFile` e `isFirstLogin` en respuesta
- ✅ Método `login()`:
  - Incluye `photoFile` en la consulta del usuario
  - Retorna `photoFile` e `isFirstLogin` en respuesta
- ✅ Método `refresh()`:
  - Incluye `photoFile` en la consulta del usuario
  - Retorna información completa del usuario
- ✅ **Nuevo**: Método `changePassword()`:
  - Valida contraseña actual
  - Previene uso de la misma contraseña
  - Marca `isFirstLogin` como `false` si es primera vez
  - Registra cambio en auditoría

---

### 4. **Controladores Actualizados**

#### `AuthController`
- ✅ Endpoint `POST /auth/register`:
  - Soporta `multipart/form-data` con `@UseInterceptors(FileInterceptor('photo'))`
  - Campo `photo` opcional para subir foto de perfil
  - Documentación Swagger completa
- ✅ **Nuevo**: Endpoint `POST /auth/change-password`:
  - Protegido con `@UseGuards(JwtAuthGuard)`
  - Requiere `currentPassword` y `newPassword`
  - Documentación Swagger con respuestas de error

---

### 5. **Módulos Actualizados**

#### `AuthModule`
- ✅ Importado `FilesModule` para usar `FilesService`

---

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con bcrypt (salt rounds: 12)
- ✅ Validación de contraseña actual antes de cambiar
- ✅ Prevención de reutilización de la misma contraseña
- ✅ Autenticación JWT requerida para cambio de contraseña
- ✅ Auditoría completa de cambios de contraseña

---

## 📝 Auditoría

Todos los cambios están registrados en el sistema de auditoría:

- ✅ Creación de usuarios
- ✅ Actualización de usuarios (con campo-level tracking)
- ✅ Cambio de contraseña (acción: `PASSWORD_CHANGED`)
- ✅ Login/Logout
- ✅ Subida de archivos

---

## 🎨 Buenas Prácticas Implementadas

1. **Separación de responsabilidades**: 
   - DTOs específicos para cada operación
   - Servicios especializados para cada funcionalidad

2. **Validación robusta**:
   - Validadores de class-validator en todos los DTOs
   - Validaciones de negocio en los servicios

3. **Manejo de archivos limpio**:
   - Uso del servicio centralizado `FilesService`
   - Validación de tipos y tamaños de archivo
   - Almacenamiento en Cloudinary/S3

4. **Documentación Swagger**:
   - Todos los endpoints documentados
   - Ejemplos de request/response
   - Códigos de estado HTTP apropiados

5. **Transacciones**:
   - Uso de transacciones de Prisma para operaciones críticas
   - Garantiza consistencia de datos

6. **Auditoría completa**:
   - Registro de todas las acciones importantes
   - Tracking de cambios a nivel de campo

---

## 🧪 Endpoints Disponibles

### Autenticación

```
POST   /auth/register           - Registrar usuario (con foto opcional)
POST   /auth/login              - Iniciar sesión
POST   /auth/refresh            - Refrescar token
POST   /auth/logout             - Cerrar sesión
GET    /auth/me                 - Obtener perfil actual
POST   /auth/change-password    - Cambiar contraseña (requiere auth)
```

### Usuarios

```
POST   /users                   - Crear usuario
GET    /users                   - Listar usuarios
GET    /users/:id               - Obtener usuario
PATCH  /users/:id               - Actualizar usuario
DELETE /users/:id               - Eliminar usuario (soft delete)
```

---

## 📋 Ejemplo de Uso

### Registrar usuario con foto

```bash
curl -X POST http://localhost:3000/auth/register \
  -F "name=John Doe" \
  -F "email=john@example.com" \
  -F "password=password123" \
  -F "role=SECRETARY" \
  -F "photo=@/path/to/photo.jpg"
```

### Cambiar contraseña

```bash
curl -X POST http://localhost:3000/auth/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword456"
  }'
```

---

## ⚠️ Notas Importantes

1. **Primera migración**: El campo `isFirstLogin` se inicializa en `true` por defecto
2. **Fotos existentes**: Los usuarios con `photoUrl` antiguo necesitarán actualizar su foto
3. **Validación de archivos**: Las fotos deben ser JPG/PNG y máximo 5MB
4. **Cambio de contraseña**: Automáticamente marca `isFirstLogin` como `false`

---

## 🚀 Próximos Pasos Recomendados

1. Agregar endpoint para subir/actualizar foto de perfil de usuarios existentes
2. Implementar recuperación de contraseña por email
3. Agregar política de expiración de contraseñas
4. Implementar historial de contraseñas (prevenir reutilización)
5. Agregar validación de complejidad de contraseñas (mayúsculas, números, caracteres especiales)

---

## 📚 Documentación de Referencia

- [NestJS File Upload](https://docs.nestjs.com/techniques/file-upload)
- [Prisma Relations](https://www.prisma.io/docs/concepts/components/prisma-schema/relations)
- [Class Validator](https://github.com/typestack/class-validator)
- [Bcrypt](https://github.com/kelektiv/node.bcrypt.js)
