import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'generated/prisma';
import { FileResponseDto } from '../../user/dto/user.dto';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe', minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.SECRETARY })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiPropertyOptional({ example: '+591 12345678' })
  @IsString()
  @IsOptional()
  cellphone?: string;

  @ApiPropertyOptional({ example: '1234567' })
  @IsString()
  @IsOptional()
  ci?: string;

  @ApiPropertyOptional({ example: 'Santa Cruz' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ example: 'Dirección Regional Norte' })
  @IsString()
  @IsOptional()
  departmentalDirectorateUnit?: string;

  // Este campo se omite del DTO porque se envía como archivo multipart
  // La foto se manejará en el controller con @UploadedFile()
}

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'your-refresh-token' })
  @IsString()
  refreshToken: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    example: 'currentPassword123',
    description: 'Contraseña actual del usuario',
  })
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty({
    example: 'newPassword123',
    description: 'Nueva contraseña (mínimo 6 caracteres)',
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'your-access-token' })
  accessToken: string;

  @ApiProperty({ example: 'your-refresh-token' })
  refreshToken: string;

  @ApiProperty({
    type: 'object',
    description: 'User information',
    properties: {
      id: { type: 'string', example: 'user-id' },
      name: { type: 'string', example: 'John Doe' },
      email: { type: 'string', example: 'john@example.com' },
      role: {
        type: 'string',
        enum: Object.values(UserRole),
        example: UserRole.SECRETARY,
      },
      photoFile: {
        type: 'object',
        nullable: true,
        properties: {
          id: { type: 'string' },
          url: { type: 'string' },
          filename: { type: 'string' },
        },
      },
      isFirstLogin: { type: 'boolean', example: true },
      cellphone: { type: 'string', nullable: true, example: '+591 12345678' },
      ci: { type: 'string', nullable: true, example: '1234567' },
      department: { type: 'string', nullable: true, example: 'Santa Cruz' },
      departmentalDirectorateUnit: { 
        type: 'string', 
        nullable: true, 
        example: 'Dirección Regional Norte' 
      },
    },
  })
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    photoFile?: FileResponseDto | null;
    isFirstLogin: boolean;
    cellphone?: string | null;
    ci?: string | null;
    department?: string | null;
    departmentalDirectorateUnit?: string | null;
  };
}

export class LogoutDto {
  @ApiProperty({ example: 'your-refresh-token' })
  @IsString()
  refreshToken: string;
}
