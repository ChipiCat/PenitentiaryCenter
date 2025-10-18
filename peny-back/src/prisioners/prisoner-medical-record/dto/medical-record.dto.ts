import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { FileResponseDto } from '../../../files/dto/file.dto';

export class CreateMedicalRecordDto {
	@ApiPropertyOptional({ example: 'Dr. Juan Perez' })
	@IsOptional()
	@IsString()
	doctor_name?: string;

	@ApiPropertyOptional({ example: '2025-10-18' })
	@IsOptional()
	@IsDateString()
	examination_date?: string;

	@ApiPropertyOptional({ example: 'REF-12345' })
	@IsOptional()
	@IsString()
	reference_number?: string;

	@ApiPropertyOptional({ example: 'Paciente estable.' })
	@IsOptional()
	@IsString()
	notes?: string;
}

export class UpdateMedicalRecordDto {
	@ApiPropertyOptional({ example: 'Dr. Juan Perez' })
	@IsOptional()
	@IsString()
	doctor_name?: string;

	@ApiPropertyOptional({ example: '2025-10-18' })
	@IsOptional()
	@IsDateString()
	examination_date?: string;

	@ApiPropertyOptional({ example: 'REF-12345' })
	@IsOptional()
	@IsString()
	reference_number?: string;

	@ApiPropertyOptional({ example: 'Paciente estable.' })
	@IsOptional()
	@IsString()
	notes?: string;
}

export class MedicalRecordResponseDto extends CreateMedicalRecordDto {
	@ApiProperty({ example: 'cuid123' })
	id: string;

	@ApiProperty({ example: 'prisoner_cuid123' })
	prisoner_id: string;

	@ApiPropertyOptional({ example: 'file_cuid123' })
	file_id?: string;

	@ApiPropertyOptional({ type: () => FileResponseDto })
	file?: FileResponseDto;

	@ApiProperty({ example: 'user_cuid123' })
	created_by: string;

	@ApiProperty({ example: 'user_cuid456' })
	updated_by: string;

	@ApiProperty({ example: '2025-10-18T12:00:00.000Z' })
	created_at: string;

	@ApiProperty({ example: '2025-10-18T12:00:00.000Z' })
	updated_at: string;
}

export class UploadMedicalFileDto {
	@ApiProperty({
		type: 'string',
		format: 'binary',
		description: 'Documento médico (PDF o imagen)',
	})
	file: any;
}
