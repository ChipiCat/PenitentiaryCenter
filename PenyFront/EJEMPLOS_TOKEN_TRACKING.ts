// EJEMPLOS PRÁCTICOS DE USO - Token Tracking
// Este archivo contiene ejemplos de cómo usar el sistema de tracking de tokens

// ============================================
// EJEMPLO 1: En un Hook Personalizado
// ============================================

/*
import { useEffect, useState } from 'react';
import { tokenManager } from '@/shared/services';

export const useAuthStatus = () => {
  const [authStatus, setAuthStatus] = useState({
    isAuthenticated: false,
    hasValidTokens: false,
  });

  useEffect(() => {
    const checkAuth = () => {
      const hasAccess = !!tokenManager.getAccessToken();
      const hasRefresh = !!tokenManager.getRefreshToken();

      setAuthStatus({
        isAuthenticated: hasAccess,
        hasValidTokens: hasAccess && hasRefresh,
      });
    };

    checkAuth();

    // Monitorear cambios
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, []);

  return authStatus;
};
*/

// ============================================
// EJEMPLO 2: Debugging en Componente
// ============================================

/*
import { useTokenDebug } from '@/shared/hooks';

export const DebugPanel = () => {
  const { tokenStatus, getLogs } = useTokenDebug();

  const handleExportLogs = () => {
    const logs = getLogs();
    console.log('=== TOKEN LOGS ===');
    logs.forEach((log: any) => {
      console.log(
        `[${log.timestamp}] ${log.action}`,
        log.tokenExists ? 'YES' : 'NO',
        log.details
      );
    });
  };

  return (
    <div style={{ padding: '20px', background: '#f5f5f5' }}>
      <h3>Token Status</h3>
      <p>
        Access Token:{' '}
        {tokenStatus.hasAccessToken ? 'Present' : 'Missing'}
      </p>
      <p>
        Refresh Token:{' '}
        {tokenStatus.hasRefreshToken ? 'Present' : 'Missing'}
      </p>
      <button onClick={handleExportLogs}>Export Logs</button>
    </div>
  );
};
*/

// ============================================
// EJEMPLO 3: Debugging en DevTools Console
// ============================================

/* 
Copia y pega en DevTools Console (F12 → Console):

// Ver último log
console.log(tokenManager.getLogs().slice(-1)[0]);

// Ver todos los logs de refresh
tokenManager.getLogs()
  .filter(l => l.action.includes('REFRESH'))
  .forEach(l => console.table(l));

// Ver cuándo se borraron los tokens
tokenManager.getLogs()
  .filter(l => l.action === 'CLEAR_TOKENS')
  .forEach(l => console.log(`BORRADO EN: ${l.timestamp}`));

// Ver tabla completa
tokenManager.printLogs(); // O:
console.table(tokenManager.getLogs());

// Descargar logs como JSON
const logs = tokenManager.exportLogs();
console.log(logs);

// Buscar errores
tokenManager.getLogs()
  .filter(l => l.action.includes('ERROR'))
  .forEach(l => console.error(l));
*/

// ============================================
// EJEMPLO 4: Monitoreo en tiempo real
// ============================================

// En la consola, ejecutar:
/*
setInterval(() => {
  console.clear();
  const latest = tokenManager.getLogs().slice(-5);
  console.log('=== ÚLTIMOS 5 LOGS ===');
  console.table(latest);
}, 2000);
*/

// ============================================
// EJEMPLO 5: Custom Service con Token Manager
// ============================================

import api, { tokenManager } from '@/shared/services';

export const customApiCall = async (endpoint: string) => {
  try {
    console.log(`[API] Calling ${endpoint}`);
    
    // Verificar token disponible
    const token = tokenManager.getAccessToken();
    if (!token) {
      console.warn('[API] No access token available');
      return null;
    }

    const response = await api.get(endpoint);
    console.log('[API] Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] Error:', error);
    
    // Ver log de lo que pasó
    const logs = tokenManager.getLogs().slice(-10);
    console.log('Últimas acciones de token:', logs);
    
    return null;
  }
};

// ============================================
// EJEMPLO 6: Test de Refresh Token
// ============================================

export const testTokenRefresh = async () => {
  console.log('=== INICIANDO TEST DE REFRESH ===');
  
  // 1. Verificar tokens iniciales
  const initialLogs = tokenManager.getLogs().length;
  console.log(`Logs antes: ${initialLogs}`);

  // 2. Hacer un request que falle con 401
  try {
    // Este endpoint debería devolver 401 para testear refresh
    await api.get('/protected-endpoint');
  } catch (error) {
    console.log('Error esperado:', error);
  }

  // 3. Ver qué pasó
  const finalLogs = tokenManager.getLogs();
  const newLogs = finalLogs.slice(initialLogs);
  
  console.log('=== RESULTADO DEL TEST ===');
  console.table(newLogs);

  // 4. Verificar que tokens se actualizaron
  const hasAccessToken = !!tokenManager.getAccessToken();
  const hasRefreshToken = !!tokenManager.getRefreshToken();
  
  console.log({
    hasAccessToken,
    hasRefreshToken,
    testPassed: hasAccessToken && hasRefreshToken,
  });
};

// ============================================
// EJEMPLO 7: Integración en App.tsx
// ============================================

/*
import { App } from './App';
import { TokenDebugger } from '@/shared/components';
import { tokenManager } from '@/shared/services';

// Inicializar monitoreo global
if (import.meta.env.DEV) {
  window.tokenManager = tokenManager;
  
  // Agregar comando de test en consola
  window.testTokens = async () => {
    console.log('=== TOKEN STATUS ===');
    console.log('Access:', !!tokenManager.getAccessToken());
    console.log('Refresh:', !!tokenManager.getRefreshToken());
    console.log('Logs:', tokenManager.getLogs().length);
  };
}

export function Root() {
  return (
    <>
      <App />
      {import.meta.env.VITE_DEBUG_TOKENS === 'true' && <TokenDebugger />}
    </>
  );
}

// Ahora puedes en console:
// tokenManager.printLogs()
// testTokens()
*/

// ============================================
// EJEMPLO 8: Tests Automatizados
// ============================================

/*
import { describe, it, expect, beforeEach } from 'vitest';
import { tokenManager } from '@/shared/services';

describe('Token Manager', () => {
  beforeEach(() => {
    localStorage.clear();
    tokenManager.clearLogs();
  });

  it('debería guardar y recuperar access token', () => {
    const token = 'test-access-token-123';
    tokenManager.setAccessToken(token);
    
    expect(tokenManager.getAccessToken()).toBe(token);
    expect(tokenManager.getLogs().length).toBeGreaterThan(0);
  });

  it('debería limpiar todos los tokens', () => {
    tokenManager.setAccessToken('access-123');
    tokenManager.setRefreshToken('refresh-456');
    
    tokenManager.clearTokens();
    
    expect(tokenManager.getAccessToken()).toBeNull();
    expect(tokenManager.getRefreshToken()).toBeNull();
  });

  it('debería registrar todas las operaciones', () => {
    const initialCount = tokenManager.getLogs().length;
    
    tokenManager.getAccessToken();
    tokenManager.setAccessToken('test');
    tokenManager.clearTokens();
    
    expect(tokenManager.getLogs().length).toBeGreaterThan(initialCount);
  });
});
*/

// ============================================
// EJEMPLO 9: Habilitar en .env
// ============================================

/*
En .env.development:

VITE_API_URL=http://localhost:3001
VITE_DEBUG_TOKENS=true

En .env.production:

VITE_API_URL=https://api.tudominio.com
VITE_DEBUG_TOKENS=false
*/

// ============================================
// EJEMPLO 10: Búsqueda de Problemas
// ============================================

export const debugTokenIssues = () => {
  const logs = tokenManager.getLogs();
  
  console.group('🔍 TOKEN ISSUE REPORT');
  
  // Buscar borradores no esperados
  const clearLogs = logs.filter(l => l.action === 'CLEAR_TOKENS');
  console.log(`Tokens borrados: ${clearLogs.length} veces`);
  clearLogs.forEach(log => {
    console.log(`  ⏰ ${log.timestamp} - ${log.details}`);
  });

  // Buscar errores de refresh
  const errorLogs = logs.filter(l => l.action.includes('ERROR'));
  console.log(`Errores: ${errorLogs.length}`);
  errorLogs.forEach(log => {
    console.log(`  ⚠️ ${log.action} - ${log.details}`);
  });

  // Buscar refrescos exitosos
  const successLogs = logs.filter(l => l.action === 'REFRESH_SUCCESS');
  console.log(`Refrescos exitosos: ${successLogs.length}`);

  // Estadísticas
  const operations = {};
  logs.forEach(log => {
    operations[log.action] = (operations[log.action] || 0) + 1;
  });
  console.table(operations);

  console.groupEnd();
};

// En consola: debugTokenIssues()
