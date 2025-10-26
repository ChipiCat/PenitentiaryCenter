# 🚀 Quick Start Guide - Búsqueda Avanzada de Prisioneros

## ⚡ Inicio Rápido

### 1. Búsqueda Simple

**Buscar por nombre:**
```bash
GET /api/prisoners/search?query=Juan
```

**Respuesta esperada:** Lista de prisioneros con nombre "Juan" (perfiles completos)

---

### 2. Filtrar por Estado

**Buscar solo prisioneros activos:**
```bash
GET /api/prisoners/search?filters[status]=Activo
```

**Valores posibles para status:**
- `Activo`
- `Trasladado`
- `Liberado`
- `Archivado`

---

### 3. Búsqueda con Paginación

**Primera página, 20 resultados:**
```bash
GET /api/prisoners/search?page=1&limit=20
```

**Segunda página:**
```bash
GET /api/prisoners/search?page=2&limit=20
```

---

### 4. Búsqueda Combinada

**Buscar "García" que estén activos:**
```bash
GET /api/prisoners/search?query=García&filters[status]=Activo
```

---

## 📋 Filtros Más Comunes

### Por Género
```bash
GET /api/prisoners/search?filters[gender]=Masculino
```
Valores: `Masculino`, `Femenino`, `Otro`

### Por Ubicación
```bash
GET /api/prisoners/search?filters[buildingNumber]=A&filters[cellNumber]=101
```

### Por Categoría Penitenciaria
```bash
GET /api/prisoners/search?filters[category]=DerechoComun
```
Valores: `DerechoComun`, `PrisionPreventiva`, `PrisioneroAcusado`

### Por Rango de Fechas
```bash
GET /api/prisoners/search?filters[admissionDateFrom]=2024-01-01&filters[admissionDateTo]=2024-12-31
```

---

## 🎯 Casos de Uso Reales

### Caso 1: Buscar prisioneros del edificio A que estén activos
```bash
GET /api/prisoners/search?filters[status]=Activo&filters[buildingNumber]=A
```

### Caso 2: Buscar prisioneros extranjeros
```bash
GET /api/prisoners/search?filters[citizenshipType]=CiudadanoExtranjero
```

### Caso 3: Buscar por nombre y ordenar por apellido
```bash
GET /api/prisoners/search?query=Juan&orderBy=surname&orderDirection=asc
```

### Caso 4: Listar prisioneros ingresados este año
```bash
GET /api/prisoners/search?filters[admissionDateFrom]=2024-01-01&orderBy=admissionDate&orderDirection=desc
```

---

## 🔑 Autenticación

**Todas las peticiones requieren token JWT:**

```http
GET /api/prisoners/search?query=test
Authorization: Bearer YOUR_JWT_TOKEN_HERE
```

**Obtener token (login):**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

---

## 📊 Estructura de Respuesta

Cada resultado incluye:

✅ **Datos básicos del prisionero**
- ID, número de registro, fecha de admisión, estado

✅ **Identidad**
- Nombre completo, foto, huellas dactilares, nacionalidad

✅ **Información personal**
- Género, estado civil, ocupación, educación

✅ **Información penitenciaria**
- Categoría, edificio, celda, cama

✅ **Registros médicos**
- Exámenes, doctores, archivos

✅ **Pertenencias**
- Lista de objetos personales guardados

✅ **Contactos**
- Familiares y contactos de emergencia

✅ **Hijos**
- Información de hijos del prisionero

---

## 🎨 Ejemplo de Respuesta

```json
{
  "data": [
    {
      "prisoner": {
        "id": "clx123...",
        "registration_number": "REG-2024-001",
        "status": "Activo",
        ...
      },
      "identity": {
        "surname": "García",
        "first_name": "Juan",
        "photo_file": { ... },
        ...
      },
      "personal": { ... },
      "penitentiary": { ... },
      "medical_records": [ ... ],
      "belongings": [ ... ],
      "contacts": [ ... ],
      "children": [ ... ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  },
  "searchInfo": {
    "searchQuery": "Juan",
    "filtersApplied": ["status"]
  }
}
```

---

## 🔧 Testing

### Usar Swagger UI (Recomendado)
1. Iniciar el servidor: `npm run start:dev`
2. Abrir: http://localhost:3000/api
3. Expandir sección "Prisoners"
4. Buscar endpoint "GET /prisoners/search"
5. Clic en "Try it out"
6. Ingresar parámetros
7. Clic en "Execute"

### Usar REST Client (VS Code)
1. Instalar extensión "REST Client"
2. Abrir archivo: `src/prisioners/search-examples.http`
3. Actualizar `@token` con tu JWT
4. Clic en "Send Request" sobre cualquier ejemplo

### Usar cURL
```bash
curl -X GET "http://localhost:3000/api/prisoners/search?query=Juan&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📚 Documentación Completa

Para más detalles, consultar:

1. **SEARCH_API.md** - Documentación completa de la API
2. **RESPONSE_EXAMPLES.md** - Ejemplos de respuestas JSON
3. **IMPLEMENTATION_SUMMARY.md** - Resumen técnico de implementación
4. **search-examples.http** - 15+ ejemplos de uso

---

## 💡 Tips y Mejores Prácticas

### ✅ Hacer

1. **Usa paginación** - No más de 50 resultados por página
2. **Combina filtros** - Más precisos = más rápidos
3. **Ordena resultados** - Mejora la experiencia de usuario
4. **Cachea en cliente** - Los perfiles completos son grandes

### ❌ Evitar

1. **No solicitar 100+ resultados** - Muy lento
2. **No hacer búsquedas vacías** - Usa al menos un filtro
3. **No ignorar la paginación** - Siempre implementarla
4. **No hacer polling constante** - Usa websockets si necesitas updates en tiempo real

---

## 🐛 Solución de Problemas

### Error 401 Unauthorized
- **Causa:** Token inválido o expirado
- **Solución:** Hacer login nuevamente

### Error 400 Bad Request
- **Causa:** Parámetros inválidos
- **Solución:** Verificar formato de filtros y valores

### Respuesta vacía
- **Causa:** No hay resultados para la búsqueda
- **Solución:** Ampliar criterios de búsqueda

### Búsqueda muy lenta
- **Causa:** Demasiados resultados o búsqueda de texto muy amplia
- **Solución:** Agregar más filtros para reducir resultados

---

## 🚀 Siguientes Pasos

1. ✅ Probar búsqueda simple
2. ✅ Probar con filtros
3. ✅ Implementar paginación en frontend
4. ✅ Implementar ordenamiento en UI
5. ✅ Agregar caché si es necesario
6. ✅ Monitorear performance

---

## 📞 Soporte

Si encuentras algún problema:

1. Revisa la documentación completa en `SEARCH_API.md`
2. Verifica ejemplos en `search-examples.http`
3. Consulta respuestas esperadas en `RESPONSE_EXAMPLES.md`
4. Revisa implementación técnica en `IMPLEMENTATION_SUMMARY.md`

---

## ✨ Características Destacadas

- 🔍 **Búsqueda en 12 campos** diferentes
- 🎯 **11 filtros** combinables
- 📄 **Paginación** optimizada
- 🗂️ **Ordenamiento** flexible
- 📦 **Perfiles completos** en una sola llamada
- ⚡ **Performance optimizado** con índices
- 📚 **Documentación completa** con ejemplos
- 🔒 **Seguro** con JWT authentication

---

**¡Listo para usar! 🎉**

Para comenzar, simplemente haz tu primera búsqueda:
```bash
GET /api/prisoners/search?query=test
```
