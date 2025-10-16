import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class CreatePersonalDto {
	@ApiPropertyOptional({ enum: ['Masculino', 'Femenino', 'Otro'] })
	@IsOptional()
	@IsIn(['Masculino', 'Femenino', 'Otro'])
	gender?: 'Masculino' | 'Femenino' | 'Otro';

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	father_name?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	mother_name?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	education_level?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	occupation?: string;

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	languages?: string;

	@ApiPropertyOptional({ enum: ['Soltero', 'Casado', 'Viudo', 'Divorciado'] })
	@IsOptional()
	@IsIn(['Soltero', 'Casado', 'Viudo', 'Divorciado'])
	marital_status?: 'Soltero' | 'Casado' | 'Viudo' | 'Divorciado';

	@ApiPropertyOptional({ enum: ['CedulaDeIdentidad', 'Pasaporte', 'Otro'] })
	@IsOptional()
	@IsIn(['CedulaDeIdentidad', 'Pasaporte', 'Otro'])
	id_document_type?: 'CedulaDeIdentidad' | 'Pasaporte' | 'Otro';

	@ApiPropertyOptional()
	@IsOptional()
	@IsString()
	id_document_number?: string;
}

export class PersonalResponseDto extends CreatePersonalDto {
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
