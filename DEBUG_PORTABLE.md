# 🐛 Guía de Debugging - Portable que no Abre

## 🎯 Problema Actual

El portable se genera correctamente pero no abre. Necesitamos diagnosticar por qué.

## 📋 Pasos para Debugging

### 1️⃣ Ejecutar Script de Debugging

```powershell
.\debug-portable.ps1
```

Este script:
- ✅ Encuentra el portable automáticamente
- ✅ Limpia logs anteriores
- ✅ Verifica procesos existentes
- ✅ Verifica puertos ocupados
- ✅ Ejecuta el portable
- ✅ Captura y muestra los logs

### 2️⃣ Ver Logs Manualmente

```powershell
.\ver-logs.ps1
```

O directamente:
```powershell
notepad "$env:APPDATA\SIGEPEN\app.log"
```

### 3️⃣ Verificar Instalador vs Portable

El problema puede ser específico del portable. Prueba el instalador:

```powershell
# Generar instalador completo
npm run package:win

# Instalar y probar
cd release
# Ejecutar SIGEPEN-3.0.2-x64.exe
```

## 🔍 Causas Comunes

### 1. Backend no Inicia

**Síntomas**:
- El portable abre pero se cierra inmediatamente
- No aparece ventana

**Diagnóstico**:
Ver logs en `$env:APPDATA\SIGEPEN\app.log` buscando:
```
[Backend Error]
Cannot find module
```

**Solución**:
Las dependencias externas no se copiaron. Verificar `package.json` en `extraResources`.

### 2. Puerto Ocupado

**Síntomas**:
- La app abre pero no carga
- Logs muestran "EADDRINUSE"

**Diagnóstico**:
```powershell
netstat -ano | findstr ":3000"
netstat -ano | findstr ":4321"
```

**Solución**:
```powershell
# Matar proceso en puerto 3000
$pid = (netstat -ano | findstr ":3000").Split()[-1]
Stop-Process -Id $pid -Force

# O usar el script
.\kill-ports.ps1
```

### 3. Base de Datos No Encontrada

**Síntomas**:
- Backend inicia pero da error de Prisma
- Logs muestran "Can't reach database"

**Diagnóstico**:
Ver logs buscando:
```
[Backend Error] Prisma
```

**Solución**:
Verificar que el `.env` tenga la ruta correcta de la base de datos.

### 4. Dependencias Faltantes

**Síntomas**:
- Error "Cannot find module '@prisma/client'"
- Error "Cannot find module 'class-validator'"

**Diagnóstico**:
Ver logs del backend.

**Solución**:
Las dependencias externas deben estar en `extraResources`. Ya están configuradas en esta versión.

### 5. Permisos de Windows

**Síntomas**:
- El portable no ejecuta nada
- Windows muestra advertencia

**Diagnóstico**:
Click derecho en el .exe > Propiedades > Desbloquear

**Solución**:
```powershell
# Desbloquear el archivo
Unblock-File -Path ".\release\SIGEPEN-*.exe"
```

## 🛠️ Soluciones Aplicadas

### ✅ Logging Mejorado

- Logs se escriben en `$env:APPDATA\SIGEPEN\app.log`
- Captura todos los errores del backend
- Captura errores de inicio

### ✅ Verificación de Archivos

El `main.ts` ahora verifica:
- Que el directorio del backend existe
- Que `main.js` existe en producción
- Lista archivos si hay error

### ✅ Mejor Manejo de Errores

- Captura errores de "Cannot find module"
- Rechaza inmediatamente si hay error crítico
- No espera timeout si hay error

### ✅ Dependencias Externas Completas

Ahora se copian:
- `@prisma/client` y `.prisma`
- `class-validator` y `class-transformer`
- `@aws-sdk/*` (todo el SDK)
- `cloudinary`
- `nodemailer`
- `bcryptjs`
- `passport` y `passport-jwt`
- `cache-manager`

### ✅ NODE_PATH Configurado

```typescript
env: {
  ...process.env,
  NODE_PATH: join(backendPath, "node_modules"),
}
```

## 📊 Proceso de Debugging

### Paso 1: Limpiar y Rebuild

```powershell
# Limpiar
npm run clean

# Rebuild backend
cd peny-back
npm run build:prod
cd ..

# Rebuild electron
npm run build:electron

# Package
npm run package:win:portable
```

### Paso 2: Ejecutar con Debugging

```powershell
.\debug-portable.ps1
```

### Paso 3: Analizar Logs

Buscar en los logs:
- `[Backend] Iniciando...` - Backend intentó iniciar
- `[Backend] ✓ Iniciado correctamente` - Backend OK
- `[Backend Error]` - Errores del backend
- `Cannot find module` - Dependencia faltante
- `EADDRINUSE` - Puerto ocupado

### Paso 4: Probar Instalador

Si el portable falla pero el instalador funciona, el problema es con la configuración portable específica.

## 🎯 Script de Prueba Rápida

```powershell
# 1. Limpiar
npm run clean

# 2. Build completo
npm run build

# 3. Package portable
npm run package:win:portable

# 4. Debug
.\debug-portable.ps1
```

## 📝 Checklist de Verificación

Antes de hacer package, verificar:

- [ ] Backend compila sin errores: `cd peny-back && npm run build:prod`
- [ ] Frontend compila sin errores: `cd PenyFront && npm run build`
- [ ] Electron compila sin errores: `npm run build:electron`
- [ ] No hay procesos SIGEPEN corriendo: `Get-Process SIGEPEN*`
- [ ] Puertos 3000 y 4321 están libres
- [ ] El .env existe en peny-back

## 🆘 Si Nada Funciona

### Opción 1: Volver a Build Normal (Sin Optimizaciones)

Temporalmente, puedes usar el build sin esbuild:

```powershell
# En peny-back/package.json cambiar build:prod a usar nest build
cd peny-back
npm run build  # En lugar de build:prod
cd ..
npm run build:electron
npm run package:win:portable
```

### Opción 2: Usar Solo el Instalador

El instalador (NSIS) a veces maneja mejor las dependencias:

```powershell
npm run package:win
# Usar SIGEPEN-3.0.2-x64.exe en lugar del portable
```

### Opción 3: Verificar Manualmente las Dependencias

```powershell
# Después de package, extraer y verificar
cd release/win-unpacked
dir resources/backend/node_modules

# Verificar que están todas las carpetas:
# - @prisma
# - .prisma
# - class-validator
# - class-transformer
# - @aws-sdk
# - cloudinary
# - nodemailer
# - bcryptjs
# - passport
# - passport-jwt
# - cache-manager
```

## 📚 Archivos de Ayuda

- **`debug-portable.ps1`** - Debugging automático
- **`ver-logs.ps1`** - Visor de logs
- **`kill-ports.ps1`** - Liberar puertos

## 🎯 Próximos Pasos

1. Ejecuta: `.\debug-portable.ps1`
2. Revisa los logs que muestre
3. Comparte los errores específicos que veas
4. Ajustaremos según el error real

---

**Última actualización**: Noviembre 2025
**Estado**: En debugging
