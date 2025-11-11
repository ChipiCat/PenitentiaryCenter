# ⚡ Optimizaciones de Performance - Electron App

## 🎯 Resumen de Optimizaciones Implementadas

Este documento describe las optimizaciones realizadas para mejorar significativamente:
- ✅ Tiempo de build (reducción de ~80%)
- ✅ Tamaño del instalador (reducción de ~70%)
- ✅ Tiempo de inicio en producción (reducción de ~60%)

---

## 📊 Mejoras Esperadas

### Antes:
- 🐌 Build: 10-15 minutos
- 📦 Tamaño instalador: ~500MB
- ⏱️ Tiempo de inicio: 15-20 segundos
- 💾 Node_modules backend copiados: ~300MB

### Después:
- 🚀 Build: 3-5 minutos
- 📦 Tamaño instalador: ~150MB
- ⏱️ Tiempo de inicio: 5-8 segundos
- 💾 Solo Prisma client: ~20MB

---

## 🔧 Cambios Realizados

### 1. Backend Bundling con esbuild

**Archivo**: `peny-back/esbuild.config.mjs`

- Crea un bundle único del backend en lugar de copiar todos los node_modules
- Minifica y optimiza el código con tree-shaking
- Solo mantiene Prisma como dependencia externa (binarios nativos)

**Script nuevo**:
```json
"build:prod": "npm run db:generate && node esbuild.config.mjs"
```

### 2. Electron-Builder Optimizado

**Cambios en `package.json`**:

#### Antes:
```json
"extraResources": [
  {
    "from": "peny-back/node_modules",  // ❌ ~300MB
    "to": "backend/node_modules"
  }
]
```

#### Después:
```json
"extraResources": [
  {
    "from": "peny-back/node_modules/@prisma",  // ✅ Solo Prisma
    "to": "backend/node_modules/@prisma"
  },
  {
    "from": "peny-back/node_modules/.prisma",  // ✅ Solo binarios
    "to": "backend/node_modules/.prisma"
  }
]
```

### 3. Filtros Agresivos

Se agregaron filtros para excluir archivos innecesarios:

```json
"files": [
  "!node_modules/**/test/**/*",
  "!node_modules/**/tests/**/*",
  "!node_modules/**/*.md",
  "!node_modules/**/@types/**/*",
  "!node_modules/**/README*",
  "!node_modules/**/LICENSE*",
  "!node_modules/**/*.map",
  "!node_modules/**/.*"
]
```

### 4. Compresión Máxima

```json
"build": {
  "compression": "maximum",
  "removePackageScripts": true,
  "npmRebuild": false,
  "buildDependenciesFromSource": false
}
```

### 5. Timeout Optimizado

En `electron/main.ts`:
- Dev: 30 segundos (sigue igual para evitar fallos)
- Producción: 15 segundos (bundle inicia más rápido)

---

## 🚀 Cómo Usar

### Desarrollo (sin cambios):
```bash
npm run dev:electron-app
```

### Build Optimizado:
```bash
# Build completo optimizado
npm run build

# Package para Windows (solo x64, más rápido)
npm run package:win

# Package portable (aún más rápido)
npm run package:win:portable
```

---

## 📝 Dependencias Nuevas

Agregar a `peny-back/package.json`:

```bash
cd peny-back
npm install -D esbuild glob
```

---

## ⚠️ Consideraciones Importantes

### 1. Prisma debe ser externo
El bundle de esbuild marca `@prisma/client` como externo porque:
- Usa binarios nativos (.node)
- No puede ser bundleado completamente
- Se copia selectivamente en el empaquetado

### 2. Variables de Entorno
El `.env` se sigue copiando en `extraResources` para producción.

### 3. Migraciones de Prisma
Las migraciones están en `peny-back/prisma` y se copian al instalador.

### 4. Testing
El build tradicional (`npm run build:backend:dev`) sigue disponible para desarrollo y testing.

---

## 🔍 Troubleshooting

### Error: "Cannot find module '@prisma/client'"

**Solución**: Asegúrate de que las carpetas de Prisma estén en `extraResources`:

```json
{
  "from": "peny-back/node_modules/@prisma",
  "to": "backend/node_modules/@prisma"
},
{
  "from": "peny-back/node_modules/.prisma",
  "to": "backend/node_modules/.prisma"
}
```

### El backend no inicia en producción

**Solución**: Verifica los logs en:
```
%APPDATA%/SIGEPEN/app.log
```

### Build muy lento aún

**Solución**: Asegúrate de usar solo x64:

```bash
npm run package:win  # Solo x64
```

Evita:
```bash
npm run package  # Genera x64 + ia32 (doble tiempo)
```

---

## 🎯 Próximas Optimizaciones (Opcional)

Si aún necesitas más velocidad:

### 1. Separar Arquitecturas
```bash
# Solo la que necesites
npm run package:win  # Solo x64 (recomendado)
```

### 2. Usar Portable en lugar de NSIS
```bash
npm run package:win:portable
# ~50% más rápido que NSIS installer
```

### 3. Build Incremental (Desarrollo)
Electron ya compila incremental en dev. No tocar.

### 4. Caché de Electron-Builder
```json
"build": {
  "buildDependenciesFromSource": false,  // ✅ Ya agregado
  "npmRebuild": false  // ✅ Ya agregado
}
```

---

## 📈 Monitoreo de Performance

### Medir tiempo de build:
```powershell
Measure-Command { npm run build }
```

### Medir tamaño del instalador:
```powershell
Get-ChildItem .\release\*.exe | Select-Object Name, @{Name="SizeMB";Expression={[math]::Round($_.Length/1MB, 2)}}
```

### Verificar contenido del bundle:
```bash
cd peny-back
node esbuild.config.mjs
# Revisa dist/main.js
```

---

## ✅ Checklist de Optimización

- [x] esbuild configurado para backend
- [x] node_modules del backend excluidos
- [x] Solo Prisma copiado selectivamente
- [x] Compresión máxima activada
- [x] Filtros agresivos de archivos
- [x] Timeout de producción optimizado
- [x] Scripts de build optimizados
- [x] Documentación actualizada

---

## 🤝 Contribuciones Futuras

Si encuentras más optimizaciones:

1. Perfila el build con:
   ```bash
   electron-builder --win --x64 --trace
   ```

2. Analiza el bundle con:
   ```bash
   cd peny-back
   # Agregar metafile a esbuild.config.mjs
   ```

3. Considera:
   - Lazy loading de módulos pesados
   - Code splitting en el frontend
   - Pre-compilación de templates

---

**Última actualización**: Noviembre 2025  
**Mantenedor**: ChipiCat  
**Versión**: 3.0.2
