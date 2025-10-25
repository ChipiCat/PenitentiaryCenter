# 📝 Ejemplos de Respuestas JSON - API de Búsqueda

## Respuesta Exitosa Completa

```json
{
  "data": [
    {
      "prisoner": {
        "id": "clx1a2b3c4d5e6f7g8h9",
        "registration_number": "REG-2024-001",
        "admission_date": "2024-10-15T00:00:00.000Z",
        "fiscal_file_number": "FISC-2024-001",
        "status": "Activo",
        "isDeleted": false,
        "created_by": "user-uuid-123",
        "updated_by": "user-uuid-123",
        "created_at": "2024-10-15T10:30:00.000Z",
        "updated_at": "2024-10-15T10:30:00.000Z"
      },
      "identity": {
        "id": "idy-uuid-456",
        "prisoner_id": "clx1a2b3c4d5e6f7g8h9",
        "photo_file_id": "file-photo-789",
        "right_fingerprint_file_id": "file-right-fp-012",
        "left_fingerprint_file_id": "file-left-fp-345",
        "surname": "García",
        "first_name": "Juan Carlos",
        "birth_date": "1990-05-15T00:00:00.000Z",
        "birth_place": "Ciudad de México, México",
        "residence": "Calle Principal 123, Col. Centro, CDMX",
        "citizenship_type": "CiudadanoNacional",
        "country_of_origin": "México",
        "nationality_type": "Por nacimiento",
        "nationality": "Mexicana",
        "photo_file": {
          "id": "file-photo-789",
          "url": "https://res.cloudinary.com/xxx/image/upload/v123/prisoners/photo.jpg",
          "storagePath": "prisoners/clx1a2b3c4d5e6f7g8h9/photo",
          "filename": "photo_20241015.jpg",
          "originalName": "juan_garcia_foto.jpg",
          "mimeType": "image/jpeg",
          "extension": "jpg",
          "size": 245680,
          "storageType": "cloudinary",
          "entityType": "prisoner_identity",
          "entityId": "idy-uuid-456",
          "fieldName": "photo",
          "createdBy": "user-uuid-123",
          "createdAt": "2024-10-15T10:32:00.000Z"
        },
        "right_fingerprint": {
          "id": "file-right-fp-012",
          "url": "https://res.cloudinary.com/xxx/image/upload/v123/fingerprints/right.jpg",
          "filename": "right_fingerprint.jpg",
          "mimeType": "image/jpeg",
          "size": 156890,
          "storageType": "cloudinary",
          "entityType": "prisoner_identity",
          "entityId": "idy-uuid-456",
          "fieldName": "right_fingerprint",
          "createdBy": "user-uuid-123",
          "createdAt": "2024-10-15T10:33:00.000Z"
        },
        "left_fingerprint": {
          "id": "file-left-fp-345",
          "url": "https://res.cloudinary.com/xxx/image/upload/v123/fingerprints/left.jpg",
          "filename": "left_fingerprint.jpg",
          "mimeType": "image/jpeg",
          "size": 158920,
          "storageType": "cloudinary",
          "entityType": "prisoner_identity",
          "entityId": "idy-uuid-456",
          "fieldName": "left_fingerprint",
          "createdBy": "user-uuid-123",
          "createdAt": "2024-10-15T10:34:00.000Z"
        },
        "isDeleted": false,
        "created_by": "user-uuid-123",
        "updated_by": "user-uuid-123",
        "created_at": "2024-10-15T10:31:00.000Z",
        "updated_at": "2024-10-15T10:31:00.000Z"
      },
      "personal": {
        "id": "per-uuid-678",
        "prisoner_id": "clx1a2b3c4d5e6f7g8h9",
        "gender": "Masculino",
        "father_name": "Pedro García López",
        "mother_name": "María Rodríguez Sánchez",
        "education_level": "Licenciatura",
        "occupation": "Contador Público",
        "languages": "Español, Inglés",
        "marital_status": "Soltero",
        "id_document_type": "CedulaDeIdentidad",
        "id_document_number": "GACJ900515HDFRRN01",
        "created_by": "user-uuid-123",
        "updated_by": "user-uuid-123",
        "created_at": "2024-10-15T10:35:00.000Z",
        "updated_at": "2024-10-15T10:35:00.000Z"
      },
      "penitentiary": {
        "id": "pen-uuid-901",
        "prisoner_id": "clx1a2b3c4d5e6f7g8h9",
        "category": "DerechoComun",
        "building_number": "A",
        "cell_number": "101",
        "bed_number": "2",
        "created_by": "user-uuid-123",
        "updated_by": "user-uuid-123",
        "created_at": "2024-10-15T10:36:00.000Z",
        "updated_at": "2024-10-15T10:36:00.000Z"
      },
      "medical_records": [
        {
          "id": "med-uuid-234",
          "prisoner_id": "clx1a2b3c4d5e6f7g8h9",
          "doctor_name": "Dr. Roberto Martínez",
          "examination_date": "2024-10-20T09:00:00.000Z",
          "reference_number": "MED-2024-001",
          "file_id": "file-medical-567",
          "notes": "Examen médico de ingreso. Estado general: bueno. Presión arterial: 120/80. Sin enfermedades crónicas detectadas.",
          "file": {
            "id": "file-medical-567",
            "url": "https://res.cloudinary.com/xxx/raw/upload/v123/medical/report.pdf",
            "filename": "medical_report_20241020.pdf",
            "originalName": "examen_medico_juan_garcia.pdf",
            "mimeType": "application/pdf",
            "extension": "pdf",
            "size": 1245680,
            "storageType": "cloudinary",
            "entityType": "medical_record",
            "entityId": "med-uuid-234",
            "fieldName": "medical_file",
            "createdBy": "user-uuid-123",
            "createdAt": "2024-10-20T09:30:00.000Z"
          },
          "created_by": "user-uuid-123",
          "updated_by": "user-uuid-123",
          "created_at": "2024-10-20T09:00:00.000Z",
          "updated_at": "2024-10-20T09:00:00.000Z"
        },
        {
          "id": "med-uuid-890",
          "prisoner_id": "clx1a2b3c4d5e6f7g8h9",
          "doctor_name": "Dra. Ana López",
          "examination_date": "2024-10-23T14:00:00.000Z",
          "reference_number": "MED-2024-015",
          "notes": "Revisión de control. Todo en orden.",
          "created_by": "user-uuid-123",
          "updated_by": "user-uuid-123",
          "created_at": "2024-10-23T14:00:00.000Z",
          "updated_at": "2024-10-23T14:00:00.000Z"
        }
      ],
      "belongings": [
        {
          "id": "bel-uuid-123",
          "prisoner_id": "clx1a2b3c4d5e6f7g8h9",
          "description": "Reloj de pulsera marca Casio, modelo G-Shock",
          "quantity": 1,
          "condition": "Bueno",
          "returned": false,
          "file_id": "file-inventory-456",
          "file": {
            "id": "file-inventory-456",
            "url": "https://res.cloudinary.com/xxx/image/upload/v123/belongings/watch.jpg",
            "filename": "belonging_watch.jpg",
            "mimeType": "image/jpeg",
            "size": 345670,
            "storageType": "cloudinary",
            "entityType": "prisoner_belonging",
            "entityId": "bel-uuid-123",
            "fieldName": "inventory_photo",
            "createdBy": "user-uuid-123",
            "createdAt": "2024-10-15T11:00:00.000Z"
          },
          "created_by": "user-uuid-123",
          "updated_by": "user-uuid-123",
          "created_at": "2024-10-15T11:00:00.000Z",
          "updated_at": "2024-10-15T11:00:00.000Z"
        },
        {
          "id": "bel-uuid-789",
          "prisoner_id": "clx1a2b3c4d5e6f7g8h9",
          "description": "Cartera de cuero con tarjetas y efectivo ($500 MXN)",
          "quantity": 1,
          "condition": "Bueno",
          "returned": false,
          "created_by": "user-uuid-123",
          "updated_by": "user-uuid-123",
          "created_at": "2024-10-15T11:01:00.000Z",
          "updated_at": "2024-10-15T11:01:00.000Z"
        }
      ],
      "contacts": [
        {
          "id": "con-uuid-345",
          "prisoner_id": "clx1a2b3c4d5e6f7g8h9",
          "name": "María García Rodríguez",
          "relationship": "Hermana",
          "phone": "+52 55 5555 1234",
          "created_by": "user-uuid-123",
          "updated_by": "user-uuid-123",
          "created_at": "2024-10-15T11:05:00.000Z",
          "updated_at": "2024-10-15T11:05:00.000Z"
        },
        {
          "id": "con-uuid-678",
          "prisoner_id": "clx1a2b3c4d5e6f7g8h9",
          "name": "Pedro García López",
          "relationship": "Padre",
          "phone": "+52 55 5555 5678",
          "created_by": "user-uuid-123",
          "updated_by": "user-uuid-123",
          "created_at": "2024-10-15T11:06:00.000Z",
          "updated_at": "2024-10-15T11:06:00.000Z"
        }
      ],
      "children": [
        {
          "id": "chi-uuid-901",
          "prisoner_id": "clx1a2b3c4d5e6f7g8h9",
          "full_name": "Carlos García López",
          "birth_date": "2015-03-10T00:00:00.000Z",
          "created_by": "user-uuid-123",
          "updated_by": "user-uuid-123",
          "created_at": "2024-10-15T11:10:00.000Z",
          "updated_at": "2024-10-15T11:10:00.000Z"
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
    "filtersApplied": [
      "status",
      "gender"
    ]
  }
}
```

## Respuesta con Resultados Vacíos

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  },
  "searchInfo": {
    "searchQuery": "NoExiste",
    "filtersApplied": []
  }
}
```

## Respuesta con Datos Mínimos

```json
{
  "data": [
    {
      "prisoner": {
        "id": "clx9z8y7x6w5v4u3t2s1",
        "registration_number": "REG-2024-002",
        "admission_date": "2024-11-01T00:00:00.000Z",
        "status": "Activo",
        "isDeleted": false,
        "created_by": "user-uuid-456",
        "updated_by": "user-uuid-456",
        "created_at": "2024-11-01T08:00:00.000Z",
        "updated_at": "2024-11-01T08:00:00.000Z"
      },
      "identity": {
        "id": "idy-uuid-098",
        "prisoner_id": "clx9z8y7x6w5v4u3t2s1",
        "surname": "López",
        "first_name": "María",
        "isDeleted": false,
        "created_by": "user-uuid-456",
        "updated_by": "user-uuid-456",
        "created_at": "2024-11-01T08:05:00.000Z",
        "updated_at": "2024-11-01T08:05:00.000Z"
      },
      "medical_records": [],
      "belongings": [],
      "contacts": [],
      "children": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  },
  "searchInfo": {
    "searchQuery": "María",
    "filtersApplied": []
  }
}
```

## Respuesta con Solo Filtros (Sin Query)

```json
{
  "data": [
    {
      "prisoner": {
        "id": "clxabc123def456ghi789",
        "registration_number": "REG-2024-010",
        "admission_date": "2024-09-15T00:00:00.000Z",
        "status": "Activo",
        "isDeleted": false,
        "created_by": "user-uuid-789",
        "updated_by": "user-uuid-789",
        "created_at": "2024-09-15T10:00:00.000Z",
        "updated_at": "2024-09-15T10:00:00.000Z"
      },
      "identity": {
        "id": "idy-uuid-321",
        "prisoner_id": "clxabc123def456ghi789",
        "surname": "Pérez",
        "first_name": "José",
        "citizenship_type": "CiudadanoExtranjero",
        "country_of_origin": "Guatemala",
        "nationality": "Guatemalteca",
        "isDeleted": false,
        "created_by": "user-uuid-789",
        "updated_by": "user-uuid-789",
        "created_at": "2024-09-15T10:05:00.000Z",
        "updated_at": "2024-09-15T10:05:00.000Z"
      },
      "personal": {
        "id": "per-uuid-654",
        "prisoner_id": "clxabc123def456ghi789",
        "gender": "Masculino",
        "marital_status": "Casado",
        "created_by": "user-uuid-789",
        "updated_by": "user-uuid-789",
        "created_at": "2024-09-15T10:10:00.000Z",
        "updated_at": "2024-09-15T10:10:00.000Z"
      },
      "penitentiary": {
        "id": "pen-uuid-987",
        "prisoner_id": "clxabc123def456ghi789",
        "category": "PrisionPreventiva",
        "building_number": "B",
        "cell_number": "205",
        "created_by": "user-uuid-789",
        "updated_by": "user-uuid-789",
        "created_at": "2024-09-15T10:15:00.000Z",
        "updated_at": "2024-09-15T10:15:00.000Z"
      },
      "medical_records": [],
      "belongings": [],
      "contacts": [],
      "children": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  },
  "searchInfo": {
    "filtersApplied": [
      "citizenshipType",
      "category"
    ]
  }
}
```

## Error 400 - Parámetros Inválidos

```json
{
  "statusCode": 400,
  "message": [
    "page must not be less than 1",
    "limit must not be greater than 100"
  ],
  "error": "Bad Request"
}
```

## Error 401 - No Autorizado

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

## Error 403 - Token Inválido

```json
{
  "statusCode": 403,
  "message": "Invalid or expired token",
  "error": "Forbidden"
}
```

## Notas sobre la Respuesta

### Campos Opcionales

Los siguientes campos pueden ser `undefined` o no estar presentes:

- `prisoner.fiscal_file_number`
- `identity` (todo el objeto)
- `personal` (todo el objeto)
- `penitentiary` (todo el objeto)
- Cualquier campo opcional dentro de estos objetos
- Arrays vacíos para `medical_records`, `belongings`, `contacts`, `children`

### Formato de Fechas

Todas las fechas están en formato ISO 8601:
```
"2024-10-15T10:30:00.000Z"
```

### Archivos

Los objetos `file` solo aparecen si el archivo fue cargado. Contienen:
- URL pública para acceso
- Metadata del archivo (tamaño, tipo MIME, etc.)
- Información de almacenamiento (Cloudinary, S3, etc.)

### Paginación

La metadata de paginación siempre está presente:
- `page`: Página actual
- `limit`: Resultados por página
- `total`: Total de resultados encontrados
- `totalPages`: Total de páginas disponibles

### Search Info

Proporciona contexto sobre la búsqueda realizada:
- `searchQuery`: El texto de búsqueda usado (si existe)
- `filtersApplied`: Array de nombres de filtros aplicados
