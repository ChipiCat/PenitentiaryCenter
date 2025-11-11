# 🚀 Paso a Paso - Primera Vez

Esta es tu guía para la primera vez que uses las optimizaciones.

---

## 📋 Checklist Inicial

Antes de comenzar, verifica:
- [ ] Node.js instalado
- [ ] npm funcional
- [ ] Proyecto en `PenitentiaryCenter`
- [ ] Backend y Frontend instalados

---

## 🎯 Pasos a Seguir

### PASO 1: Verificar las Dependencias ✅

Las dependencias ya están instaladas, pero verifica:

```powershell
cd peny-back
npm list esbuild
# Debería mostrar esbuild@^0.24.0
```

Si no está instalado:
```powershell
npm install -D esbuild glob
```

---

### PASO 2: Probar el Build del Backend 🔧

```powershell
cd peny-back
npm run build:prod
```

**Resultado esperado**:
```
📦 Building backend with esbuild...
  dist\main.js  2.9mb
Done in 501ms
✅ Backend bundle created successfully!
📊 Bundle stats:
   - Output: dist/main.js
   - Size: 2.92 MB
```

Si ves esto, ¡perfecto! 🎉

---

### PASO 3: Build Completo Optimizado 🏗️

Vuelve a la raíz del proyecto:
```powershell
cd ..
npm run build
```

Esto ejecutará en orden:
1. Build del frontend (Vite)
2. Build del backend (esbuild) ← ¡Nuevo y rápido!
3. Build de Electron (TypeScript)

**Tiempo esperado**: 1-3 minutos

---

### PASO 4: Crear el Instalador 📦

```powershell
npm run package:win
```

**⏱️ Tiempo**: 3-5 minutos (antes 10-15 minutos)

**Progreso**:
```
• building        target=nsis file=release\SIGEPEN-3.0.2.exe...
• packaging       platform=win32 arch=x64...
• building block map  blockMapFile=release\SIGEPEN-3.0.2.exe.blockmap
```

---

### PASO 5: Verificar el Resultado ✅

```powershell
dir release\*.exe
```

**Resultado esperado**:
```
SIGEPEN-3.0.2-x64.exe    ~150 MB
```

---

### PASO 6: Probar el Instalador 🎮

1. Navega a la carpeta `release/`
2. Ejecuta `SIGEPEN-3.0.2-x64.exe`
3. Instala la aplicación
4. Abre SIGEPEN

**Verifica**:
- ✅ La app abre en ~5-8 segundos
- ✅ El backend inicia correctamente
- ✅ No hay errores en consola
- ✅ Todas las funciones trabajan

---

## 🎯 Opción Rápida: Benchmark Automático

Si quieres hacer todo de una vez:

```powershell
.\benchmark-optimizations.ps1
```

Este script:
1. ✅ Verifica dependencias
2. ✅ Limpia builds anteriores
3. ✅ Ejecuta build optimizado
4. ✅ Muestra estadísticas
5. ✅ Te dice cuánto tiempo tomó

---

## 📊 Comparación ANTES vs DESPUÉS

### ANTES (sin optimizaciones) ❌
```powershell
npm run package:win
# Tiempo: 10-15 minutos
# Salida: SIGEPEN-3.0.2.exe (~500 MB)
# Inicio: 15-20 segundos
# Archivos: ~50,000 copiados
```

### DESPUÉS (con optimizaciones) ✅
```powershell
npm run package:win
# Tiempo: 3-5 minutos
# Salida: SIGEPEN-3.0.2-x64.exe (~150 MB)
# Inicio: 5-8 segundos
# Archivos: ~1,000 copiados
```

---

## 🎮 Desarrollo (NO cambió)

Para desarrollo, todo sigue igual:

```powershell
# Opción 1: Backend + Frontend separados
npm run dev

# Opción 2: Backend + Frontend + Electron
npm run dev:electron-app
```

---

## 🐛 Problemas Comunes

### Error: "esbuild not found"
```powershell
cd peny-back
npm install -D esbuild glob
```

### Error: "Cannot find module '@prisma/client'"
```powershell
cd peny-back
npm run db:generate
```

### Build muy lento aún
Asegúrate de usar:
```powershell
npm run package:win      # ✅ Solo x64
```

NO uses:
```powershell
npm run package          # ❌ Genera todas las arquitecturas
```

### Backend no inicia en producción
Ver logs:
```powershell
type "$env:APPDATA\SIGEPEN\app.log"
```

---

## 📈 Medir Tiempos (Opcional)

### Tiempo de build:
```powershell
Measure-Command { npm run build }
```

### Tiempo de package:
```powershell
Measure-Command { npm run package:win }
```

### Tamaño del instalador:
```powershell
Get-ChildItem .\release\*.exe | Select-Object Name, @{Name="SizeMB";Expression={[math]::Round($_.Length/1MB, 2)}}
```

---

## ✅ Checklist Final

Después de hacer el build, verifica:
- [ ] Build completado sin errores
- [ ] Instalador generado en `release/`
- [ ] Tamaño del instalador ~150 MB
- [ ] Instalador funciona correctamente
- [ ] App inicia en < 10 segundos
- [ ] Backend responde correctamente
- [ ] Todas las funciones trabajan

---

## 🎉 ¡Listo!

Si todo funciona, ya tienes las optimizaciones activas.

**Beneficios**:
- ✅ Builds 70% más rápidos
- ✅ Instalador 70% más pequeño
- ✅ Inicio 60% más rápido
- ✅ Mismo código, mejor performance

---

## 📚 Más Información

- **Resumen**: `OPTIMIZACIONES_RESUMEN.md`
- **Guía Rápida**: `OPTIMIZACIONES_QUICKSTART.md`
- **Documentación Técnica**: `OPTIMIZACIONES_PERFORMANCE.md`

---

## 🤝 ¿Necesitas Ayuda?

1. Revisa los logs en `$env:APPDATA\SIGEPEN\app.log`
2. Consulta la sección de troubleshooting en `OPTIMIZACIONES_RESUMEN.md`
3. Verifica que todas las dependencias estén instaladas

---

**¡Éxito con tu aplicación optimizada!** 🚀
