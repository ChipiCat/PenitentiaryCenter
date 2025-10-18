import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PrisonerResponseDTO } from './prisoner.dto';
import { IdentityResponseDto } from '../../prisoner-identity/dto/identity.dto';
import { PersonalResponseDto } from '../../prisoner-personal/dto/personal.dto';
import { PenitentiaryResponseDto } from '../../prisoner-penitentiary/dto/penitentiary.dto';
import { MedicalRecordResponseDto } from '../../prisoner-medical-record/dto/medical-record.dto';
import { BelongingResponseDto } from '../../prisoner-belonging/dto/belonging.dto';
import { ContactResponseDto } from '../../prisoner-contact/dto/contact.dto';
import { ChildResponseDto } from '../../prisoner-children/dto/childre.dto';

/**
 * DTO para el perfil completo del prisionero
 * Incluye toda la información relacionada en una sola respuesta
 * Útil para visualización de perfil completo
 */
export class CompletePrisonerProfileDto {
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
    description: 'Registros médicos del prisionero',
    type: [MedicalRecordResponseDto],
  })
  medical_records: MedicalRecordResponseDto[];

  @ApiProperty({
    description: 'Pertenencias del prisionero',
    type: [BelongingResponseDto],
  })
  belongings: BelongingResponseDto[];

  @ApiProperty({
    description: 'Contactos de emergencia del prisionero',
    type: [ContactResponseDto],
  })
  contacts: ContactResponseDto[];

  @ApiProperty({
    description: 'Hijos del prisionero',
    type: [ChildResponseDto],
  })
  children: ChildResponseDto[];
}
