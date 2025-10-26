# 🔍 API de Búsqueda Avanzada de Prisioneros

## Descripción General

El endpoint de búsqueda avanzada permite realizar búsquedas complejas de prisioneros con múltiples filtros y paginación. Devuelve perfiles completos incluyendo toda la información relacionada de cada prisionero.

## Endpoint

```
GET /api/prisoners/search
```

## Autenticación

Requiere token JWT Bearer en el header:
```
Authorization: Bearer <your_jwt_token>
```

## Parámetros de Query

### Paginación

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Número de página (mínimo: 1) |
| `limit` | integer | 10 | Resultados por página (máximo: 100) |

### Búsqueda de Texto

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `query` | string | Texto de búsqueda. Busca en: nombre, apellido, número de registro, expediente fiscal, documento de identidad, lugar de nacimiento, residencia, país de origen, nacionalidad, ocupación, nombres de padres |

### Filtros Específicos

| Parámetro | Tipo | Valores Posibles |
|-----------|------|------------------|
| `filters[status]` | enum | `Activo`, `Trasladado`, `Liberado`, `Archivado` |
| `filters[gender]` | enum | `Masculino`, `Femenino`, `Otro` |
| `filters[maritalStatus]` | enum | `Soltero`, `Casado`, `Viudo`, `Divorciado` |
| `filters[category]` | enum | `DerechoComun`, `PrisionPreventiva`, `PrisioneroAcusado` |
| `filters[citizenshipType]` | enum | `Local`, `CiudadanoNacional`, `CiudadanoExtranjero` |
| `filters[admissionDateFrom]` | string (ISO 8601) | Fecha de admisión desde (ej: `2024-01-01`) |
| `filters[admissionDateTo]` | string (ISO 8601) | Fecha de admisión hasta (ej: `2025-12-31`) |
| `filters[buildingNumber]` | string | Número de edificio |
| `filters[cellNumber]` | string | Número de celda |
| `filters[countryOfOrigin]` | string | País de origen |
| `filters[nationality]` | string | Nacionalidad |

### Ordenamiento

| Parámetro | Tipo | Default | Valores Posibles |
|-----------|------|---------|------------------|
| `orderBy` | string | `createdAt` | `registrationNumber`, `admissionDate`, `surname`, `firstName`, `createdAt`, `updatedAt` |
| `orderDirection` | enum | `desc` | `asc`, `desc` |

### Opciones Adicionales

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `includeDeleted` | boolean | false | Incluir registros eliminados (soft delete) |

## Ejemplos de Uso

### 1. Búsqueda Simple por Nombre

```bash
GET /api/prisoners/search?query=Juan&page=1&limit=10
```

### 2. Búsqueda con Filtro de Estado

```bash
GET /api/prisoners/search?filters[status]=Activo&page=1&limit=20
```

### 3. Búsqueda por Género y Estado Civil

```bash
GET /api/prisoners/search?filters[gender]=Masculino&filters[maritalStatus]=Soltero
```

### 4. Búsqueda por Rango de Fechas

```bash
GET /api/prisoners/search?filters[admissionDateFrom]=2024-01-01&filters[admissionDateTo]=2024-12-31
```

### 5. Búsqueda de Texto con Múltiples Filtros

```bash
GET /api/prisoners/search?query=García&filters[status]=Activo&filters[category]=DerechoComun&orderBy=surname&orderDirection=asc
```

### 6. Búsqueda por Ubicación Penitenciaria

```bash
GET /api/prisoners/search?filters[buildingNumber]=A&filters[cellNumber]=101
```

### 7. Búsqueda por Nacionalidad

```bash
GET /api/prisoners/search?filters[citizenshipType]=CiudadanoExtranjero&filters[countryOfOrigin]=México
```

### 8. Búsqueda Compleja

```bash
GET /api/prisoners/search?
  query=Juan&
  filters[status]=Activo&
  filters[gender]=Masculino&
  filters[category]=PrisionPreventiva&
  filters[admissionDateFrom]=2024-01-01&
  filters[buildingNumber]=A&
  orderBy=admissionDate&
  orderDirection=desc&
  page=1&
  limit=20
```

## Respuesta

### Estructura de Respuesta Exitosa (200 OK)

```json
{
  "data": [
    {
      "prisoner": {
        "id": "clx123...",
        "registration_number": "REG-001",
        "admission_date": "2024-10-15T00:00:00.000Z",
        "fiscal_file_number": "FISC-001",
        "status": "Activo",
        "isDeleted": false,
        "created_by": "user-id",
        "updated_by": "user-id",
        "created_at": "2024-10-15T10:00:00.000Z",
        "updated_at": "2024-10-15T10:00:00.000Z"
      },
      "identity": {
        "id": "clx456...",
        "prisoner_id": "clx123...",
        "surname": "García",
        "first_name": "Juan",
        "birth_date": "1990-05-15T00:00:00.000Z",
        "birth_place": "Ciudad de México",
        "residence": "Calle Principal 123",
        "citizenship_type": "CiudadanoNacional",
        "country_of_origin": "México",
        "nationality": "Mexicana",
        "photo_file": {
          "id": "file-id",
          "url": "https://...",
          "filename": "photo.jpg",
          // ... más campos del archivo
        },
        // ... más campos
      },
      "personal": {
        "id": "clx789...",
        "prisoner_id": "clx123...",
        "gender": "Masculino",
        "father_name": "Pedro García",
        "mother_name": "María López",
        "marital_status": "Soltero",
        "occupation": "Contador",
        // ... más campos
      },
      "penitentiary": {
        "id": "clxabc...",
        "prisoner_id": "clx123...",
        "category": "DerechoComun",
        "building_number": "A",
        "cell_number": "101",
        "bed_number": "2",
        // ... más campos
      },
      "medical_records": [
        {
          "id": "med-001",
          "prisoner_id": "clx123...",
          "doctor_name": "Dr. Martínez",
          "examination_date": "2024-10-20T00:00:00.000Z",
          "notes": "Examen general",
          // ... más campos
        }
      ],
      "belongings": [
        {
          "id": "bel-001",
          "prisoner_id": "clx123...",
          "description": "Reloj",
          "quantity": 1,
          "returned": false,
          // ... más campos
        }
      ],
      "contacts": [
        {
          "id": "con-001",
          "prisoner_id": "clx123...",
          "name": "María García",
          "relationship": "Hermana",
          "phone": "+52 555 1234567",
          // ... más campos
        }
      ],
      "children": [
        {
          "id": "chi-001",
          "prisoner_id": "clx123...",
          "full_name": "Carlos García López",
          "birth_date": "2015-03-10T00:00:00.000Z",
          // ... más campos
        }
      ]
    }
    // ... más resultados
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  },
  "searchInfo": {
    "searchQuery": "Juan",
    "filtersApplied": ["status", "gender"]
  }
}
```

### Respuesta de Error (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": "Parámetros de búsqueda inválidos",
  "error": "Bad Request"
}
```

### Respuesta de Error (401 Unauthorized)

```json
{
  "statusCode": 401,
  "message": "No autorizado",
  "error": "Unauthorized"
}
```

## Optimizaciones Implementadas

### Índices de Base de Datos

Se han agregado índices en las siguientes tablas para mejorar el rendimiento:

#### Tabla `prisoners`
- `(status, isDeleted)` - Para filtrar por estado
- `(admissionDate)` - Para ordenar y filtrar por fecha
- `(registrationNumber, isDeleted)` - Para búsqueda por número de registro
- `(fiscalFileNumber)` - Para búsqueda por expediente fiscal
- `(createdAt)` - Para ordenamiento por fecha de creación

#### Tabla `prisoner_identity`
- `(surname, firstName)` - Para búsqueda y ordenamiento por nombre
- `(citizenshipType)` - Para filtrar por tipo de ciudadanía
- `(countryOfOrigin)` - Para filtrar por país de origen
- `(nationality)` - Para filtrar por nacionalidad

#### Tabla `prisoner_personal`
- `(gender)` - Para filtrar por género
- `(maritalStatus)` - Para filtrar por estado civil
- `(idDocumentNumber)` - Para búsqueda por documento

#### Tabla `prisoner_penitentiary`
- `(category)` - Para filtrar por categoría
- `(buildingNumber, cellNumber)` - Para búsqueda por ubicación

### Características de Rendimiento

1. **Búsqueda Case-Insensitive**: Todas las búsquedas de texto son insensibles a mayúsculas/minúsculas
2. **Paginación Eficiente**: Limit máximo de 100 resultados por página
3. **Carga Eager**: Se cargan todos los datos relacionados en una sola query
4. **Filtros Combinables**: Todos los filtros pueden combinarse para búsquedas precisas

## Campos de Búsqueda de Texto

El parámetro `query` busca en los siguientes campos:

### Tabla Prisoner
- `registrationNumber` (Número de registro)
- `fiscalFileNumber` (Número de expediente fiscal)

### Tabla PrisonerIdentity
- `surname` (Apellido)
- `firstName` (Nombre)
- `birthPlace` (Lugar de nacimiento)
- `residence` (Residencia)
- `countryOfOrigin` (País de origen)
- `nationality` (Nacionalidad)

### Tabla PrisonerPersonal
- `fatherName` (Nombre del padre)
- `motherName` (Nombre de la madre)
- `occupation` (Ocupación)
- `idDocumentNumber` (Número de documento)

## Mejores Prácticas

1. **Use paginación**: No solicite más de 100 resultados a la vez
2. **Combine filtros**: Use múltiples filtros para búsquedas más precisas
3. **Use búsqueda de texto sabiamente**: La búsqueda de texto es más lenta que los filtros exactos
4. **Ordene apropiadamente**: Use `orderBy` y `orderDirection` para resultados más relevantes
5. **Cache en el cliente**: Los perfiles completos pueden ser grandes, cachee cuando sea posible

## Casos de Uso Comunes

### 1. Buscar prisioneros activos de un edificio específico
```
GET /api/prisoners/search?filters[status]=Activo&filters[buildingNumber]=A
```

### 2. Buscar prisioneros por nombre ingresados en el último año
```
GET /api/prisoners/search?query=García&filters[admissionDateFrom]=2024-01-01&orderBy=admissionDate&orderDirection=desc
```

### 3. Listar todos los prisioneros extranjeros
```
GET /api/prisoners/search?filters[citizenshipType]=CiudadanoExtranjero
```

### 4. Buscar prisioneros en prisión preventiva
```
GET /api/prisoners/search?filters[category]=PrisionPreventiva&filters[status]=Activo
```

## Notas de Implementación

- La búsqueda es **case-insensitive** para mejor usabilidad
- Los registros eliminados (soft delete) están **excluidos por defecto**
- La respuesta incluye **perfiles completos** con todos los submódulos
- Los filtros se aplican con **operador AND** (todos deben cumplirse)
- La búsqueda de texto usa **operador OR** (coincide con cualquier campo)

## Documentación Swagger

La documentación interactiva está disponible en:
```
http://localhost:3000/api
```

Donde puedes probar el endpoint directamente desde el navegador.
