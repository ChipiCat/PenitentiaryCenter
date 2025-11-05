import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PaginationMetaDto,
  ResponseListDto,
} from '../../../common/interfaces/entity.interface';
import { PrisonerResponseDTO } from './prisoner.dto';
import { IdentityResponseDto } from '../../prisoner-identity/dto/identity.dto';
import { PersonalResponseDto } from '../../prisoner-personal/dto/personal.dto';
import { PenitentiaryResponseDto } from '../../prisoner-penitentiary/dto/penitentiary.dto';
import { CaseResponseDto } from '../../prisoner-case/dto/case.dto';

/**
 * Enum para tipos de filtros disponibles
 */
export enum FilterField {
  STATUS = 'status',
  GENDER = 'gender',
  MARITAL_STATUS = 'maritalStatus',
  CATEGORY = 'category',
  CITIZENSHIP_TYPE = 'citizenshipType',
  ADMISSION_DATE_FROM = 'admissionDateFrom',
  ADMISSION_DATE_TO = 'admissionDateTo',
  BUILDING_NUMBER = 'buildingNumber',
  CELL_NUMBER = 'cellNumber',
}

/**
 * DTO para filtros de búsqueda
 * Permite filtrar por múltiples campos específicos
 */
export class SearchFiltersDto {
  @ApiPropertyOptional({
    enum: ['Activo', 'Trasladado', 'Liberado', 'Archivado'],
    description: 'Filtrar por estado del prisionero',
    example: 'Activo',
  })
  @IsOptional()
  @IsEnum(['Activo', 'Trasladado', 'Liberado', 'Archivado'])
  status?: 'Activo' | 'Trasladado' | 'Liberado' | 'Archivado';

  @ApiPropertyOptional({
    enum: ['Masculino', 'Femenino', 'Otro'],
    description: 'Filtrar por género',
    example: 'Masculino',
  })
  @IsOptional()
  @IsEnum(['Masculino', 'Femenino', 'Otro'])
  gender?: 'Masculino' | 'Femenino' | 'Otro';

  @ApiPropertyOptional({
    enum: ['Soltero', 'Casado', 'Viudo', 'Divorciado'],
    description: 'Filtrar por estado civil',
    example: 'Soltero',
  })
  @IsOptional()
  @IsEnum(['Soltero', 'Casado', 'Viudo', 'Divorciado'])
  maritalStatus?: 'Soltero' | 'Casado' | 'Viudo' | 'Divorciado';

  @ApiPropertyOptional({
    enum: ['DerechoComun', 'PrisionPreventiva', 'PrisioneroAcusado'],
    description: 'Filtrar por categoría penitenciaria',
    example: 'DerechoComun',
  })
  @IsOptional()
  @IsEnum(['DerechoComun', 'PrisionPreventiva', 'PrisioneroAcusado'])
  category?: 'DerechoComun' | 'PrisionPreventiva' | 'PrisioneroAcusado';

  @ApiPropertyOptional({
    enum: ['Local', 'CiudadanoNacional', 'CiudadanoExtranjero'],
    description: 'Filtrar por tipo de ciudadanía',
    example: 'CiudadanoNacional',
  })
  @IsOptional()
  @IsEnum(['Local', 'CiudadanoNacional', 'CiudadanoExtranjero'])
  citizenshipType?: 'Local' | 'CiudadanoNacional' | 'CiudadanoExtranjero';

  @ApiPropertyOptional({
    description: 'Filtrar por fecha de admisión desde (ISO 8601)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  admissionDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por fecha de admisión hasta (ISO 8601)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  admissionDateTo?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por número de edificio',
    example: 'A',
  })
  @IsOptional()
  @IsString()
  buildingNumber?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por número de celda',
    example: '101',
  })
  @IsOptional()
  @IsString()
  cellNumber?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por país de origen',
    example: 'México',
  })
  @IsOptional()
  @IsString()
  countryOfOrigin?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por nacionalidad',
    example: 'Mexicana',
  })
  @IsOptional()
  @IsString()
  nationality?: string;
}

/**
 * DTO para parámetros de búsqueda de prisioneros
 * Incluye paginación, búsqueda de texto y filtros avanzados
 * Los filtros se reciben como parámetros planos en la query string
 */
export class SearchPrisonerQueryDto {
  @ApiPropertyOptional({
    description: 'Número de página (empieza en 1)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de resultados por página',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description:
      'Texto de búsqueda. Busca en: nombre, apellido, número de registro, número de expediente fiscal, documento de identidad, lugar de nacimiento, ocupación, nombres de padres, número de caso, crimen, corte',
    example: 'Juan Pérez',
  })
  @IsOptional()
  @IsString()
  query?: string;

  // ========== FILTROS PLANOS ==========
  // Los filtros se reciben directamente como query params

  @ApiPropertyOptional({
    enum: ['Activo', 'Trasladado', 'Liberado', 'Archivado'],
    description: 'Filtrar por estado del prisionero',
    example: 'Activo',
  })
  @IsOptional()
  @IsEnum(['Activo', 'Trasladado', 'Liberado', 'Archivado'])
  status?: 'Activo' | 'Trasladado' | 'Liberado' | 'Archivado';

  @ApiPropertyOptional({
    enum: ['Masculino', 'Femenino', 'Otro'],
    description: 'Filtrar por género',
    example: 'Masculino',
  })
  @IsOptional()
  @IsEnum(['Masculino', 'Femenino', 'Otro'])
  gender?: 'Masculino' | 'Femenino' | 'Otro';

  @ApiPropertyOptional({
    enum: ['Soltero', 'Casado', 'Viudo', 'Divorciado'],
    description: 'Filtrar por estado civil',
    example: 'Soltero',
  })
  @IsOptional()
  @IsEnum(['Soltero', 'Casado', 'Viudo', 'Divorciado'])
  maritalStatus?: 'Soltero' | 'Casado' | 'Viudo' | 'Divorciado';

  @ApiPropertyOptional({
    enum: ['DerechoComun', 'PrisionPreventiva', 'PrisioneroAcusado'],
    description: 'Filtrar por categoría penitenciaria',
    example: 'DerechoComun',
  })
  @IsOptional()
  @IsEnum(['DerechoComun', 'PrisionPreventiva', 'PrisioneroAcusado'])
  category?: 'DerechoComun' | 'PrisionPreventiva' | 'PrisioneroAcusado';

  @ApiPropertyOptional({
    enum: ['Local', 'CiudadanoNacional', 'CiudadanoExtranjero'],
    description: 'Filtrar por tipo de ciudadanía',
    example: 'CiudadanoNacional',
  })
  @IsOptional()
  @IsEnum(['Local', 'CiudadanoNacional', 'CiudadanoExtranjero'])
  citizenshipType?: 'Local' | 'CiudadanoNacional' | 'CiudadanoExtranjero';

  @ApiPropertyOptional({
    description: 'Filtrar por fecha de admisión desde (ISO 8601)',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  admissionDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por fecha de admisión hasta (ISO 8601)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString()
  admissionDateTo?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por número de edificio',
    example: 'A',
  })
  @IsOptional()
  @IsString()
  buildingNumber?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por número de celda',
    example: '101',
  })
  @IsOptional()
  @IsString()
  cellNumber?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por país de origen',
    example: 'México',
  })
  @IsOptional()
  @IsString()
  countryOfOrigin?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por nacionalidad',
    example: 'Mexicana',
  })
  @IsOptional()
  @IsString()
  nationality?: string;

  // ========== FIN FILTROS ==========

  @ApiPropertyOptional({
    description: 'Incluir registros eliminados (soft delete)',
    example: false,
    default: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  includeDeleted?: boolean = false;

  @ApiPropertyOptional({
    description: 'Campo de ordenamiento',
    enum: [
      'registrationNumber',
      'admissionDate',
      'surname',
      'firstName',
      'createdAt',
      'updatedAt',
    ],
    example: 'admissionDate',
    default: 'createdAt',
  })
  @IsOptional()
  @IsEnum([
    'registrationNumber',
    'admissionDate',
    'surname',
    'firstName',
    'createdAt',
    'updatedAt',
  ])
  orderBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Dirección del ordenamiento',
    enum: ['asc', 'desc'],
    example: 'desc',
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  orderDirection?: 'asc' | 'desc' = 'desc';
}

/**
 * DTO para perfil simplificado de prisionero en búsquedas
 * Incluye solo submódulos principales: identity, personal, penitentiary, cases
 */
export class SearchPrisonerProfileDto {
  @ApiProperty({ description: 'Información básica del prisionero' })
  prisoner: PrisonerResponseDTO;

  @ApiPropertyOptional({
    description: 'Información de identidad del prisionero',
  })
  identity?: IdentityResponseDto;

  @ApiPropertyOptional({ description: 'Información personal del prisionero' })
  personal?: PersonalResponseDto;

  @ApiPropertyOptional({
    description: 'Información penitenciaria del prisionero',
  })
  penitentiary?: PenitentiaryResponseDto;

  @ApiProperty({
    description: 'Casos judiciales del prisionero',
    type: [CaseResponseDto],
  })
  cases: CaseResponseDto[];
}

/**
 * DTO para respuesta de búsqueda de prisioneros
 * Incluye perfiles simplificados con paginación
 */
export class SearchPrisonerResponseDto extends ResponseListDto<SearchPrisonerProfileDto> {
  @ApiProperty({
    description: 'Lista de perfiles de prisioneros encontrados',
    type: [SearchPrisonerProfileDto],
  })
  data: SearchPrisonerProfileDto[];

  @ApiProperty({
    description: 'Metadatos de paginación',
    type: PaginationMetaDto,
  })
  pagination: PaginationMetaDto;

  @ApiPropertyOptional({
    description: 'Información adicional sobre la búsqueda',
    example: { searchQuery: 'Juan', filtersApplied: ['status', 'gender'] },
  })
  searchInfo?: {
    searchQuery?: string;
    filtersApplied?: string[];
  };

  constructor(
    data: SearchPrisonerProfileDto[],
    pagination: PaginationMetaDto,
    searchInfo?: { searchQuery?: string; filtersApplied?: string[] },
  ) {
    super(data, pagination);
    this.data = data;
    this.pagination = pagination;
    this.searchInfo = searchInfo;
  }
}
