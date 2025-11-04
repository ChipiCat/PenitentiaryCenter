# Integración de Backend NestJS con Electron

## 📋 Descripción

El backend de NestJS ahora está completamente integrado con Electron. Cuando ejecutas la aplicación, tanto el frontend (puerto 4321) como el backend (puerto 3000) se inician automáticamente.

## 🚀 Modo Desarrollo

### Requisitos previos
1. Asegúrate de tener todas las dependencias instaladas:
```bash
npm install
```

### Iniciar la aplicación en desarrollo

Tienes dos opciones:

#### Opción 1: Ejecutar todo desde Electron (Recomendado)
```bash
# En una terminal, inicia el frontend
npm run dev:front

# En otra terminal, inicia Electron (que iniciará el backend automáticamente)
npm run dev:electron
```

#### Opción 2: Ejecutar backend y frontend por separado
```bash
# Terminal 1: Backend
npm run dev:back

# Terminal 2: Frontend
npm run dev:front

# Terminal 3: Electron
npm run dev:electron
```

En modo desarrollo:
- **Frontend**: `http://localhost:4321` (Vite dev server)
- **Backend**: `http://localhost:3000` (NestJS server)
- Electron inicia el backend automáticamente cuando se abre

## 📦 Modo Producción

### Compilar la aplicación
```bash
npm run build
```

Este comando:
1. Compila el frontend (PenyFront)
2. Compila el backend (peny-back)

### Empaquetar la aplicación

Para Windows:
```bash
npm run package:win
```

Para Linux:
```bash
npm run package:linux
```

Para macOS:
```bash
npm run package:mac
```

En modo producción:
- El backend se empaqueta en `resources/backend/`
- El frontend se empaqueta en `resources/app/PenyFront/dist/`
- Electron gestiona ambos procesos automáticamente
- El backend se inicia en segundo plano al abrir la aplicación

## 🔧 Configuración

### Variables de Entorno

#### Frontend (PenyFront/.env)
```env
VITE_API_URL=http://localhost:3000
```

#### Backend (peny-back/.env)
Configura según tus necesidades:
```env
PORT=3000
DATABASE_URL="postgresql://user:password@localhost:5432/penitentiary"
JWT_SECRET="tu-secreto-super-seguro"
JWT_REFRESH_SECRET="tu-refresh-secret"
FRONTEND_URL="http://localhost:4321"
```

## 🏗️ Estructura de Archivos

```
PenitentiaryCenter/
├── electron/
│   ├── main.ts          # Proceso principal de Electron (incluye inicio del backend)
│   └── preload.ts       # Script de precarga
├── PenyFront/           # Frontend React + Vite
│   ├── dist/            # Build del frontend (después de compilar)
│   └── .env             # Variables de entorno del frontend
├── peny-back/           # Backend NestJS
│   ├── dist/            # Build del backend (después de compilar)
│   ├── prisma/          # Esquemas de base de datos
│   └── .env             # Variables de entorno del backend
└── package.json         # Configuración principal
```

## 🔄 Ciclo de Vida de la Aplicación

### Al iniciar:
1. Electron inicia el proceso principal
2. El backend NestJS se inicia como proceso hijo (puerto 3000)
3. Se espera a que el backend esté listo
4. Se crea la ventana de Electron con el frontend (puerto 4321 en dev, archivo local en producción)
5. El frontend se conecta al backend en localhost:3000

### Al cerrar:
1. Se cierra la ventana de Electron
2. El proceso del backend recibe señal de terminación (SIGTERM)
3. Si el backend no responde en 5 segundos, se fuerza el cierre (SIGKILL)
4. Electron finaliza completamente

## 🐛 Solución de Problemas

### El backend no inicia
1. Verifica que las dependencias estén instaladas:
   ```bash
   cd peny-back && npm install
   ```

2. Verifica que el puerto 3000 no esté en uso:
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :3000
   
   # Si está en uso, mata el proceso
   taskkill /PID <PID> /F
   ```

3. Revisa los logs de Electron en la consola

### Error de conexión entre frontend y backend
1. Verifica que `VITE_API_URL` en `PenyFront/.env` apunte a `http://localhost:3000`
2. Verifica que el CORS esté habilitado en el backend (`peny-back/src/main.ts`)
3. Asegúrate de que el backend esté corriendo antes de que el frontend intente conectarse

### Base de datos no conecta en producción
1. Asegúrate de que el archivo `.env` del backend se copie en el empaquetado
2. Verifica que la ruta a la base de datos sea accesible desde la aplicación empaquetada
3. Considera usar una base de datos SQLite para aplicaciones de escritorio o una base de datos remota

## 📝 Scripts Disponibles

### Desarrollo
- `npm run dev` - Inicia backend y frontend simultáneamente
- `npm run dev:back` - Solo backend
- `npm run dev:front` - Solo frontend
- `npm run dev:electron` - Inicia Electron (que iniciará el backend automáticamente)

### Compilación
- `npm run build` - Compila frontend y backend
- `npm run build:frontend` - Solo frontend
- `npm run build:backend` - Solo backend

### Empaquetado
- `npm run package` - Empaqueta para la plataforma actual
- `npm run package:win` - Empaqueta para Windows
- `npm run package:linux` - Empaqueta para Linux
- `npm run package:mac` - Empaqueta para macOS

### Utilidades
- `npm run clean` - Limpia todos los builds
- `npm run ci-check` - Ejecuta linters y tests

## 🔒 Consideraciones de Seguridad

1. **Nunca** incluyas credenciales reales en los archivos `.env` que se suban al repositorio
2. Usa variables de entorno diferentes para desarrollo y producción
3. El backend solo acepta conexiones desde localhost (más seguro para aplicaciones de escritorio)
4. Considera encriptar los datos sensibles en la base de datos

## 📚 Recursos Adicionales

- [Documentación de Electron](https://www.electronjs.org/docs)
- [Documentación de NestJS](https://docs.nestjs.com/)
- [Documentación de Vite](https://vitejs.dev/)
- [Electron Builder](https://www.electron.build/)
