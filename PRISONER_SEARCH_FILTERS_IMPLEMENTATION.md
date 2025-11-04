# Prisoner Search Filters - Implementation Documentation

## Overview
This document describes the implementation of properly typed prisoner search filters that match the backend API expectations.

## Architecture

### Type System Hierarchy

```
prisonerSearchTypes.ts (new)
├── PrisonerSearchFilters (matches backend SearchFiltersDto)
├── PrisonerSearchQuery (matches backend SearchPrisonerQueryDto)
├── PrisonerSearchResponse
└── SearchPrisonerProfile

Reuses from existing types:
├── PrisonerStatus (from commonTypes)
├── CitizenshipType (from commonTypes - fixed format)
├── MaritalStatus (from commonTypes - fixed values)
├── Gender (from personalTypes)
└── PrisonerCategory (new)
```

## Changes Made

### 1. New Types File: `prisonerSearchTypes.ts`

Created comprehensive type definitions matching backend DTOs:

**Key Types:**
- `PrisonerSearchFilters`: All available filter fields with proper enum types
- `PrisonerSearchQuery`: Complete query parameters for search endpoint
- `PrisonerSearchResponse`: Typed response structure
- `PrisonerCategory`: New enum for prisoner categories
- `OrderByField`: Allowed sort fields
- Type guards for runtime validation

**Filter Fields:**
- `status`: PrisonerStatus ('Activo' | 'Trasladado' | 'Liberado' | 'Archivado')
- `gender`: Gender ('Masculino' | 'Femenino' | 'Otro')
- `maritalStatus`: MaritalStatus ('Soltero' | 'Casado' | 'Viudo' | 'Divorciado')
- `category`: PrisonerCategory ('DerechoComun' | 'PrisionPreventiva' | 'PrisioneroAcusado')
- `citizenshipType`: CitizenshipType ('Local' | 'CiudadanoNacional' | 'CiudadanoExtranjero')
- `admissionDateFrom`: string (ISO 8601: YYYY-MM-DD)
- `admissionDateTo`: string (ISO 8601: YYYY-MM-DD)
- `buildingNumber`: string
- `cellNumber`: string
- `countryOfOrigin`: string
- `nationality`: string

### 2. Fixed Existing Types

**commonTypes.ts:**
- Updated `CitizenshipType` from "Ciudadano Nacional" to "CiudadanoNacional" (removed spaces)
- Updated `MaritalStatus` to match backend exactly (removed "Unión Libre")

### 3. Updated Service Layer: `prisonersService.ts`

**New Method: `searchPrisoners()`**
- Properly typed with `PrisonerSearchQuery` parameter
- Constructs query params correctly using bracket notation for nested filters
- Example: `filters[status]=Activo` instead of flat `status=Activo`
- Returns `PrisonerSearchResponse`

**Updated Method: `getAllPrisoners()`**
- Marked as deprecated
- Now uses `searchPrisoners()` internally
- Maintains backward compatibility

**Query Parameter Construction:**
```typescript
// Filters are sent as:
params['filters[status]'] = 'Activo'
params['filters[gender]'] = 'Masculino'
// etc.

// Axios serializes this to:
// ?filters[status]=Activo&filters[gender]=Masculino
```

### 4. Updated Components

**PrisonersPage.tsx:**
- Changed from `UserFilters` to `PrisonerSearchFilters`
- Updated imports and type annotations
- All handlers now use correct types

**PrisonersFilters.tsx:**
- Changed from `UserFilters` to `PrisonerSearchFilters`
- Updated Select data arrays to match exact enum values
- Removed "Unión Libre" from marital status options
- All filter fields properly typed

## Backend Compatibility

### Query String Format

When the frontend sends:
```typescript
{
  page: 1,
  limit: 12,
  query: "Juan",
  filters: {
    status: "Activo",
    gender: "Masculino",
    category: "DerechoComun"
  },
  orderBy: "admissionDate",
  orderDirection: "desc"
}
```

Axios generates:
```
GET /prisoners/search?page=1&limit=12&query=Juan&filters[status]=Activo&filters[gender]=Masculino&filters[category]=DerechoComun&orderBy=admissionDate&orderDirection=desc
```

### Backend DTO Validation

The backend `SearchPrisonerQueryDto` expects:
```typescript
{
  page?: number;
  limit?: number;
  query?: string;
  filters?: SearchFiltersDto; // Nested object
  includeDeleted?: boolean;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}
```

NestJS with `class-transformer` will automatically parse `filters[key]=value` into a nested `filters` object.

## Type Safety Benefits

1. **Compile-time validation**: TypeScript catches invalid filter values
2. **Autocomplete**: IDEs provide suggestions for all valid filter fields
3. **Runtime safety**: Type guards available for runtime validation
4. **API contract**: Frontend types match backend DTOs exactly
5. **Refactoring safety**: Changes to types propagate through codebase

## Usage Examples

### Basic Search
```typescript
const results = await prisonersService.searchPrisoners({
  page: 1,
  limit: 10,
  query: "Juan Pérez"
});
```

### With Filters
```typescript
const results = await prisonersService.searchPrisoners({
  page: 1,
  limit: 10,
  filters: {
    status: "Activo",
    gender: "Masculino",
    category: "DerechoComun",
    buildingNumber: "A",
    admissionDateFrom: "2024-01-01"
  },
  orderBy: "admissionDate",
  orderDirection: "desc"
});
```

### In Component
```typescript
const [filters, setFilters] = useState<PrisonerSearchFilters>({});

const handleFiltersChange = (newFilters: PrisonerSearchFilters) => {
  setFilters(newFilters);
};

// Filter values are type-safe
setFilters({
  status: "Activo", // ✅ Valid
  // status: "Invalid", // ❌ TypeScript error
});
```

## Testing Checklist

- [ ] Search without filters works
- [ ] Search with query text works
- [ ] Filter by status works
- [ ] Filter by gender works
- [ ] Filter by marital status works
- [ ] Filter by category works
- [ ] Filter by citizenship type works
- [ ] Filter by admission date range works
- [ ] Filter by building/cell number works
- [ ] Filter by country/nationality works
- [ ] Multiple filters work together
- [ ] Pagination works with filters
- [ ] Sorting works with filters
- [ ] Clear filters resets all values

## Migration Guide

### For Other Developers

If you need to add a new filter:

1. **Add to backend DTO** (`search-prisoner.dto.ts`):
```typescript
@ApiPropertyOptional({ description: 'New filter' })
@IsOptional()
@IsString()
newFilter?: string;
```

2. **Add to frontend type** (`prisonerSearchTypes.ts`):
```typescript
export interface PrisonerSearchFilters {
  // ... existing filters
  newFilter?: string;
}
```

3. **Add to UI component** (`PrisonersFilters.tsx`):
```tsx
<TextInput
  label="New Filter"
  value={filters.newFilter || ''}
  onChange={(e) => handleFilterChange('newFilter', e.currentTarget.value)}
/>
```

4. **TypeScript will ensure** the field is properly handled everywhere!

## Performance Considerations

- Filters are sent as query parameters (minimal payload)
- Backend uses database indexes for filtered fields
- Debounced search input prevents excessive API calls
- Memoized filter callbacks prevent unnecessary re-renders

## Future Improvements

1. Add filter presets (e.g., "Active prisoners in building A")
2. Save user's last used filters in localStorage
3. Add filter validation messages
4. Implement advanced date range pickers
5. Add filter history/undo functionality
6. Export filtered results to CSV/Excel

## Related Files

- `/PenyFront/src/shared/types/prisonerSearchTypes.ts` - New type definitions
- `/PenyFront/src/shared/types/commonTypes.ts` - Updated common types
- `/PenyFront/src/shared/services/prisonersService.ts` - API service layer
- `/PenyFront/src/features/prisoners/pages/PrisonersPage.tsx` - Main page
- `/PenyFront/src/features/prisoners/components/list/PrisonersFilters.tsx` - Filter UI
- `/peny-back/src/prisioners/prisioners-core/dto/search-prisoner.dto.ts` - Backend DTO
- `/peny-back/prisma/schema.prisma` - Database schema with enums
