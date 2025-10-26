# ⚡ Quick Start - Token Tracking System

## 1️⃣ Solo Lee Esto

Tu problema: **El refresh token se borra aleatoriamente**

La causa: **El nuevo refresh token que devolvía el backend NO se estaba guardando**

La solución: **Sistema centralizado de token tracking**

---

## 2️⃣ Qué Cambió

### ✅ Archivos Nuevos:

1. `src/shared/services/tokenManager.ts` - Core del sistema
2. `src/shared/hooks/useTokenDebug.ts` - Hook para debugging
3. `src/shared/components/TokenDebugger.tsx` - UI visual (opcional)
4. Documentación: `TOKEN_TRACKING_GUIDE.md`, `DIAGRAMS_TOKEN_SYSTEM.md`, etc.

### ✅ Archivos Modificados:

1. `src/shared/services/api.ts` - Ahora guarda nuevo refresh token
2. `src/shared/services/authService.ts` - Usa tokenManager
3. `src/shared/services/index.ts` - Exporta tokenManager

---

## 3️⃣ Usa en Consola (Ahora Mismo)

Abre DevTools (F12) → Console:

```javascript
// Ver si hay refresh token
tokenManager.getRefreshToken();

// Ver todos los eventos
tokenManager.printLogs();

// Ver solo últimos 5 eventos
console.table(tokenManager.getLogs().slice(-5));

// Exportar todos los logs
const logs = tokenManager.exportLogs();
console.log(logs);
```

---

## 4️⃣ Enablear UI Visual (Opcional)

**En `.env.development`:**
```env
VITE_DEBUG_TOKENS=true
```

**En `App.tsx`:**
```typescript
import { TokenDebugger } from '@/shared/components';

export function App() {
  return (
    <>
      <TokenDebugger /> {/* Botón 🔐 abajo a la derecha */}
      {/* tu app */}
    </>
  );
}
```

Luego podrás:
- Ver estado de tokens en tiempo real
- Exportar logs con un click
- Limpiar tokens para testing

---

## 5️⃣ Buscar Dónde Se Borra el Token

```javascript
// En DevTools Console, ejecutar:

const clearEvents = tokenManager.getLogs()
  .filter(log => log.action === 'CLEAR_TOKENS');

console.log(`El token se borró ${clearEvents.length} veces`);
clearEvents.forEach(log => {
  console.log(`⏰ ${log.timestamp} - ${log.details}`);
});
```

---

## 6️⃣ Monitorear en Tiempo Real

```javascript
// Ejecuta esto en console y deja corriendo
setInterval(() => {
  console.clear();
  const last10 = tokenManager.getLogs().slice(-10);
  console.table(last10);
}, 2000);
```

---

## 7️⃣ Ver Refrescos Fallidos

```javascript
// Si el refresh token no se actualiza:
tokenManager.getLogs()
  .filter(log => log.action.includes('REFRESH'))
  .forEach(log => {
    console.log(`${log.timestamp} - ${log.action}`);
    if (log.details) console.log(`   ${log.details}`);
  });
```

---

## 8️⃣ Test Completo

1. Abre DevTools → Network
2. Ejecuta en Console:
   ```javascript
   tokenManager.printLogs();
   ```
3. Haz login
4. Verifica que aparezcan dos logs:
   - `SET_ACCESS_TOKEN`
   - `SET_REFRESH_TOKEN`
5. Haz logout
6. Verifica que aparezca:
   - `CLEAR_TOKENS`

---

## 9️⃣ Errores Comunes

### "No veo logs"
```javascript
// Verifica que esté inicializado
console.log(tokenManager);
```

### "El token aún desaparece"
```javascript
// Busca en logs CLEAR_TOKENS o REFRESH_FAILED
tokenManager.getLogs().filter(l => 
  l.action.includes('CLEAR') || l.action.includes('FAILED')
);
```

### "Múltiples refrescos simultáneos"
```javascript
// Ver si se queuean correctamente
tokenManager.getLogs().filter(l => 
  l.action.includes('REFRESH')
);
```

---

## 🔟 Próximos Pasos

### Verificar que funciona:
- [ ] Login → ver 2 logs de SET
- [ ] Hacer un request normal → sin errors
- [ ] Esperar 401 → ver REFRESH_SUCCESS en logs
- [ ] Logout → ver 1 log de CLEAR

### Usar en producción:
- [ ] Cambiar `VITE_DEBUG_TOKENS=false` en `.env.production`
- [ ] Los logs seguirán guardándose internamente
- [ ] La UI visual no se mostrará
- [ ] El sistema funciona silenciosamente

---

## 🎯 Resumen

**Lo que puedes hacer ahora:**

✅ Ver exactamente cuándo se guarda cada token
✅ Ver cuándo se borra y por qué
✅ Monitorear refrescos automáticos
✅ Detectar race conditions
✅ Descargar logs para análisis

**Comandos útiles:**

```javascript
tokenManager.printLogs()              // Ver todo
tokenManager.getLogs()                // Array de logs
tokenManager.exportLogs()             // JSON string
tokenManager.clearLogs()              // Limpiar historial

tokenManager.getAccessToken()         // Obtener access token
tokenManager.setAccessToken(token)    // Guardar access token
tokenManager.getRefreshToken()        // Obtener refresh token
tokenManager.setRefreshToken(token)   // Guardar refresh token
tokenManager.clearTokens()            // Limpiar ambos
```

---

## 🚀 ¡Listo!

El sistema está activo. Puedes:
1. Verificar que funciona en consola
2. Habilitar UI visual si quieres
3. Monitorear cualquier problema que surja

**¡El refresh token no debería desaparecer más!** 🔐

Para más detalles, ver:
- `TOKEN_TRACKING_GUIDE.md` - Guía completa
- `DIAGRAMS_TOKEN_SYSTEM.md` - Diagramas del sistema
- `README_TOKEN_SYSTEM.md` - Resumen detallado
