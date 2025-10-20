import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LogoutReason } from '../../../generated/prisma';

// ============================================================
// CREATE SESSION LOG DTO
// ============================================================

export class CreateSessionLogDto {
  @ApiProperty({ description: 'ID of the user logging in' })
  @IsString()
  user_id: string;

  @ApiProperty({ description: 'IP address of the login' })
  @IsString()
  ip_address: string;

  @ApiProperty({ description: 'User agent of the request' })
  @IsString()
  user_agent: string;

  @ApiPropertyOptional({ description: 'Device information' })
  @IsOptional()
  @IsString()
  device_info?: string;

  @ApiPropertyOptional({ description: 'Country of origin' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'City of origin' })
  @IsOptional()
  @IsString()
  city?: string;
}

// ============================================================
// UPDATE SESSION LOG DTO (for logout)
// ============================================================

export class UpdateSessionLogDto {
  @ApiPropertyOptional({ description: 'Logout timestamp' })
  @IsOptional()
  @IsDateString()
  logout_at?: Date;

  @ApiPropertyOptional({ description: 'Is session still active', default: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ enum: LogoutReason, description: 'Reason for logout' })
  @IsOptional()
  @IsEnum(LogoutReason)
  logout_reason?: LogoutReason;
}

// ============================================================
// SESSION LOG RESPONSE DTO
// ============================================================

export class SessionLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user_id: string;

  @ApiProperty()
  login_at: Date;

  @ApiPropertyOptional()
  logout_at?: Date;

  @ApiProperty()
  ip_address: string;

  @ApiProperty()
  user_agent: string;

  @ApiPropertyOptional()
  device_info?: string;

  @ApiPropertyOptional()
  country?: string;

  @ApiPropertyOptional()
  city?: string;

  @ApiProperty()
  is_active: boolean;

  @ApiPropertyOptional({ enum: LogoutReason })
  logout_reason?: LogoutReason;
}

// ============================================================
// QUERY DTO FOR FILTERING SESSION LOGS
// ============================================================

export class SessionLogQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  @IsOptional()
  size?: number;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ enum: LogoutReason, description: 'Filter by logout reason' })
  @IsOptional()
  @IsEnum(LogoutReason)
  logout_reason?: LogoutReason;

  @ApiPropertyOptional({ description: 'Start date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({ description: 'End date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  end_date?: string;
}
