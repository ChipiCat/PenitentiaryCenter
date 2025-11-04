# 🚀 Inicio Rápido - PenitentiaryCenter con Electron

## Primera vez - Instalar dependencias

```powershell
# Instalar dependencias de todos los módulos
npm install
```

Esto instalará automáticamente las dependencias del frontend, backend y Electron.

## Desarrollo

### Opción 1: Modo completo (Recomendado)

```powershell
# Terminal 1: Iniciar frontend (Vite dev server)
npm run dev:front

# Terminal 2: Iniciar Electron (con backend integrado)
npm run dev:electron
```

### Opción 2: Backend separado (si necesitas depurar el backend)

```powershell
# Terminal 1: Backend
npm run dev:back

# Terminal 2: Frontend  
npm run dev:front

# Terminal 3: Electron (sin backend, usa el de Terminal 1)
# Comentar la línea startBackendServer() en electron/main.js temporalmente
npm run dev:electron
```

## Producción

### Compilar todo

```powershell
npm run build
```

### Empaquetar para Windows

```powershell
npm run package:win
```

El instalador se generará en `release/`

## Puertos utilizados

- **Frontend (Desarrollo)**: http://localhost:4321
- **Backend**: http://localhost:3000
- **Base de Datos**: PostgreSQL (ver .env)

## Verificar que todo funciona

1. Abre el frontend en http://localhost:4321
2. Abre DevTools (F12)
3. Ve a la pestaña Network
4. Realiza alguna acción que llame al backend
5. Verifica que las llamadas a `localhost:3000` respondan correctamente

## Comandos útiles

```powershell
# Ver todos los procesos usando puerto 3000
netstat -ano | findstr :3000

# Matar proceso por PID (si el puerto está ocupado)
taskkill /PID <PID> /F

# Limpiar todos los builds
npm run clean

# Reinstalar todas las dependencias
npm run clean
Remove-Item node_modules, peny-back/node_modules, PenyFront/node_modules -Recurse -Force
npm install
```

## Estructura de logs

Cuando ejecutes `npm run dev:electron`, verás:

```
🔧 Iniciando servidor backend...
🚀 Iniciando backend NestJS en modo desarrollo...
[Backend] Nest application successfully started
[Backend] 🚀 Application is running on: http://localhost:3000
✅ Backend iniciado correctamente
📱 Modo desarrollo:
   - Frontend: http://localhost:4321
   - Backend: http://localhost:3000
💡 Asegúrate de ejecutar "npm run dev:front" en otra terminal
```

Si ves estos mensajes, ¡todo está funcionando correctamente! 🎉
