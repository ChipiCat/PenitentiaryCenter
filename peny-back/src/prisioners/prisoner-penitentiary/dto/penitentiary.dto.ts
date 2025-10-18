// DTOs para PrisonerPenitentiary
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class CreatePenitentiaryDto {
	@ApiPropertyOptional({ enum: ['DerechoComun', 'PrisionPreventiva', 'PrisioneroAcusado'] })
	@IsOptional()
	@IsIn(['DerechoComun', 'PrisionPreventiva', 'PrisioneroAcusado'])
	category?: 'DerechoComun' | 'PrisionPreventiva' | 'PrisioneroAcusado';

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	building_number?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	cell_number?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	bed_number?: string;
}

export class PenitentiaryResponseDto extends CreatePenitentiaryDto {
	@ApiProperty()
	id: string;

	@ApiProperty()
	prisoner_id: string;

	@ApiProperty()
	created_by: string;

	@ApiProperty()
	updated_by: string;

	@ApiProperty()
	created_at: string;

	@ApiProperty()
	updated_at: string;
}
