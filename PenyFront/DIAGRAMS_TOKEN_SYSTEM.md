# 📊 Diagrama Visual del Sistema de Token Tracking

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                          REACT APP                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐      ┌──────────────────────┐          │
│  │  Componentes        │      │  TokenDebugger       │          │
│  │  (useTokenDebug)    │──────│  (UI Visual)         │          │
│  └────────┬────────────┘      └──────────────────────┘          │
│           │                                                       │
│           └──────────────────────┬─────────────────────          │
│                                  │                               │
│                         ┌────────▼─────────┐                     │
│                         │  tokenManager    │                     │
│                         │  - getToken()    │                     │
│                         │  - setToken()    │                     │
│                         │  - clearToken()  │                     │
│                         │  - printLogs()   │                     │
│                         │  - queueRefresh()│                     │
│                         └────────┬─────────┘                     │
│                                  │                               │
│                    ┌─────────────┴─────────────┐                │
│                    │                           │                │
│            ┌───────▼──────┐           ┌───────▼──────┐          │
│            │   localStorage   │           │   Log Queue  │          │
│            │ - accessToken │           │  - Historial │          │
│            │ - refreshToken│           │  - Debug Info│          │
│            └───────┬──────┘           └──────────────┘          │
│                    │                                              │
└────────────────────┼──────────────────────────────────────────────┘
                     │
          ┌──────────▼──────────┐
          │   API Interceptor   │
          │   (Axios)           │
          │  - Request:         │
          │    • Add token      │
          │  - Response:        │
          │    • Handle 401     │
          │    • Refresh token  │
          │    • Retry request  │
          └──────────┬──────────┘
                     │
          ┌──────────▼──────────┐
          │   Backend API       │
          │   - /auth/login     │
          │   - /auth/refresh   │
          │   - /auth/logout    │
          │   - otros endpoints │
          └─────────────────────┘
```

## Flujo de Login

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │ credentials
       ▼
┌──────────────┐
│  login()     │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│  api.post(/auth/login)   │
└──────┬───────────────────┘
       │
       ▼
┌────────────────────────────────────────────┐
│  Backend retorna:                          │
│  {                                         │
│    accessToken: "new_access_token",       │
│    refreshToken: "new_refresh_token",     │
│    user: { id, name, email, role }        │
│  }                                         │
└──────┬─────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│  tokenManager.setAccessToken()                   │
│  tokenManager.setRefreshToken()                  │
│  ✅ AMBOS tokens guardados en localStorage       │
│  ✅ Log: "SET_ACCESS_TOKEN"                      │
│  ✅ Log: "SET_REFRESH_TOKEN"                     │
└──────────────────────────────────────────────────┘
```

## Flujo de Refresh Token

```
┌──────────────────────────────┐
│  Request normal ejecutado    │
│  Status: 401 Unauthorized    │
└──────┬───────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  api interceptor respuesta           │
│  ¿Status === 401?                   │
└──────┬────────────────────┬──────────┘
       │ YES                │ NO
       ▼                    ▼
    ┌──────────┐       RECHAZAR
    │ Continua │
    └────┬─────┘
         │
         ▼
    ┌──────────────────────────┐
    │  ¿Tiene _retry flag?     │
    └──────┬────────┬──────────┘
           │        │
         YES       NO
           │        │
        REJECT     │
           │        ▼
           │  ┌──────────────────────────┐
           │  │ ¿Tiene refreshToken?     │
           │  └──────┬────────┬──────────┘
           │         │        │
           │        YES       NO
           │         │        │
           │         │    LOGOUT
           │         │        │
           │         ▼        ▼
           │  ┌────────────────────────┐
           │  │ tokenManager           │
           │  │ .queueRefresh()        │
           │  │                        │
           │  │ Si ya hay refresh      │
           │  │ espera en cola         │
           │  └────────┬───────────────┘
           │           │
           │           ▼
           │  ┌────────────────────────────────┐
           │  │ api.post(/auth/refresh,        │
           │  │          { refreshToken })    │
           │  └────────┬───────────┬───────────┘
           │           │           │
           │         ERROR      SUCCESS
           │           │           │
           │           │           ▼
           │           │  ┌──────────────────────┐
           │           │  │ Backend retorna:     │
           │           │  │ {                    │
           │           │  │   accessToken: "new",│
           │           │  │   refreshToken: "new"│
           │           │  │ }                    │
           │           │  └────────┬─────────────┘
           │           │           │
           │           │  ┌────────▼────────────────────┐
           │           │  │ tokenManager.               │
           │           │  │ .setAccessToken()           │
           │           │  │ .setRefreshToken()          │
           │           │  │ ✅ AMBOS guardados          │
           │           │  └────────┬────────────────────┘
           │           │           │
           │           │           ▼
           │           │  ┌──────────────────────┐
           │           │  │ Reintentar request   │
           │           │  │ original con nuevo   │
           │           │  │ accessToken          │
           │           │  └────────┬─────────────┘
           │           │           │
           │           │           ▼
           │           │    ┌─────────────┐
           │           │    │   SUCCESS   │
           │           │    └─────────────┘
           │           │
           │           ▼
           │  ┌──────────────────────┐
           │  │ CLEAR TOKENS         │
           │  │ LOGOUT               │
           │  │ REDIRECT /login      │
           │  └──────────────────────┘
           │
           └──► RECHAZAR REQUEST
```

## Ciclo de Vida de TokenManager

```
┌────────────────────────────────────────────┐
│  App Init                                   │
│  tokenManager = new TokenManager()          │
│  ✅ logs = []                               │
│  ✅ refreshInProgress = false               │
└────────────────┬───────────────────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │  User Action Occurrences   │
    └────────┬─────┬─────┬───────┘
             │     │     │
      GET    │     │     │  SET
       TOKEN │     │     │  TOKEN
             │     │     │
             ▼     │     ▼
      ┌──────────┐ │ ┌──────────┐
      │ READ     │ │ │ WRITE    │
      │ localStorage│ │localStorage│
      │ + LOG    │ │ │ + LOG    │
      └──────────┘ │ └──────────┘
             │     │
             └──┬──┘
                │
                ▼
      ┌──────────────────────────┐
      │  Log Entry Added:        │
      │  {                       │
      │    timestamp,            │
      │    action,               │
      │    tokenExists,          │
      │    tokenPreview,         │
      │    details               │
      │  }                       │
      └──────┬───────────────────┘
             │
             ▼
      ┌──────────────────────────┐
      │  Max 100 Logs Kept       │
      │  (Circular Buffer)       │
      └──────┬───────────────────┘
             │
             ▼
      ┌──────────────────────────┐
      │  Available for:          │
      │  - printLogs()           │
      │  - exportLogs()          │
      │  - getLogs()             │
      └──────────────────────────┘
```

## Prevención de Race Conditions

```
Escenario sin solución:

Request 1 → 401 ────┐
Request 2 → 401 ───┬┼─→ ¿Refrescar?
Request 3 → 401 ───┼    (Conflicto!)
             │  │  │
             └──┼──┴─→ Múltiples refreshes simultáneos
                │     (El último gana)
                └────→ Tokens inconsistentes


Solución con queueRefresh():

Request 1 → 401 ───┐
Request 2 → 401 ───┼─→ tokenManager.queueRefresh()
Request 3 → 401 ───┤   └─ Primer refresh inicia
             │  │  │      └─ Otros esperan en cola
             │  │  └─ Segundo 401 detecta
             │  │     refresh en progreso
             │  │     ✅ Espera mismo resultado
             │  │
             │  └─ Tercer 401 también espera
             │
             └─ Un único refresh
                Todos reciben mismo token nuevo
                ✅ Consistencia garantizada
```

## Logs del TokenManager

```
┌─────────────────────────────────────────────────────────────┐
│  Log Entry Structure                                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  {                                                           │
│    timestamp: "2025-10-26T14:30:45.123Z",                  │
│    action: "SET_REFRESH_TOKEN" | "GET_ACCESS_TOKEN" | ..., │
│    tokenExists: boolean,                                    │
│    tokenPreview: "abc123...xyz789",                         │
│    details?: string                                         │
│  }                                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Acciones posibles:

GET_ACCESS_TOKEN           ← Lectura de access token
GET_REFRESH_TOKEN          ← Lectura de refresh token
SET_ACCESS_TOKEN           ← Escritura de access token
SET_REFRESH_TOKEN          ← Escritura de refresh token
CLEAR_TOKENS               ← Borrado de ambos tokens
CHECK_TOKENS               ← Verificación de existencia
REFRESH_QUEUED             ← Esperando en cola
REFRESH_STARTED            ← Iniciando refresh
REFRESH_SUCCESS            ← Refresh completado
REFRESH_COMPLETED          ← Proceso terminado
REFRESH_FAILED             ← Error en refresh
SET_ACCESS_TOKEN_ERROR     ← Error guardando
SET_REFRESH_TOKEN_ERROR    ← Error guardando
CLEAR_TOKENS_ERROR         ← Error borrando
```

## Sistema Completo

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                   │
│              Token Manager Lifecycle Complete                     │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  INITIALIZATION                                            │  │
│  │  - App inicia                                              │  │
│  │  - tokenManager creado                                     │  │
│  │  - logs inicializados                                      │  │
│  └────────────────────────────────────────────────────────────┘  │
│                               │                                   │
│  ┌────────────────────────────▼────────────────────────────────┐  │
│  │  USER LOGIN                                                │  │
│  │  - Envía credentials                                       │  │
│  │  - Backend autentica                                       │  │
│  │  - Devuelve tokens + user data                             │  │
│  │  - tokenManager.setAccessToken()                           │  │
│  │  - tokenManager.setRefreshToken()                          │  │
│  │  ✅ Log: "SET_ACCESS_TOKEN"                                 │  │
│  │  ✅ Log: "SET_REFRESH_TOKEN"                                │  │
│  └────────────────────────────────────────────────────────────┘  │
│                               │                                   │
│  ┌────────────────────────────▼────────────────────────────────┐  │
│  │  NORMAL OPERATIONS                                         │  │
│  │  - API calls con accessToken en header                     │  │
│  │  - tokenManager.getAccessToken()                           │  │
│  │  ✅ Log: "GET_ACCESS_TOKEN"                                 │  │
│  └────────────────────────────────────────────────────────────┘  │
│                               │                                   │
│  ┌────────────────────────────▼────────────────────────────────┐  │
│  │  401 UNAUTHORIZED RECEIVED                                 │  │
│  │  - API interceptor detecta status 401                      │  │
│  │  - Obtiene refreshToken                                    │  │
│  │  - tokenManager.queueRefresh()                             │  │
│  │  ✅ Log: "REFRESH_STARTED"                                  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                               │                                   │
│  ┌────────────────────────────▼────────────────────────────────┐  │
│  │  REFRESH TOKEN REQUEST                                     │  │
│  │  - POST /auth/refresh { refreshToken }                     │  │
│  │  - Backend valida y genera nuevos tokens                   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                               │                                   │
│  ┌────────────────────────────▼────────────────────────────────┐  │
│  │  TOKENS UPDATED ✅                                          │  │
│  │  - tokenManager.setAccessToken(newAccessToken)             │  │
│  │  - tokenManager.setRefreshToken(newRefreshToken) ← CRÍTICO │  │
│  │  ✅ Log: "SET_ACCESS_TOKEN"                                 │  │
│  │  ✅ Log: "SET_REFRESH_TOKEN"                                 │  │
│  │  ✅ Log: "REFRESH_SUCCESS"                                   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                               │                                   │
│  ┌────────────────────────────▼────────────────────────────────┐  │
│  │  RETRY ORIGINAL REQUEST                                    │  │
│  │  - api(originalRequest)                                    │  │
│  │  - Con nuevo accessToken                                   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                               │                                   │
│  ┌────────────────────────────▼────────────────────────────────┐  │
│  │  USUARIO HACE LOGOUT                                       │  │
│  │  - Envía POST /auth/logout { refreshToken }                │  │
│  │  - Backend invalida tokens en BD                           │  │
│  │  - tokenManager.clearTokens()                              │  │
│  │  ✅ Log: "CLEAR_TOKENS"                                     │  │
│  │  - Redirect a /login                                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                               │                                   │
│  ┌────────────────────────────▼────────────────────────────────┐  │
│  │  SESSION CLEARED ✅                                         │  │
│  │  - localStorage.accessToken = null                         │  │
│  │  - localStorage.refreshToken = null                        │  │
│  │  - Logs registrados de todo el ciclo                       │  │
│  │  - Disponibles para debugging                              │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

**Diagrama completo del sistema de Token Tracking implementado** 📊
