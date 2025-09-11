import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from 'generated/prisma';

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

    @ApiPropertyOptional({ example: 'https://example.com/photo.jpg' })
    @IsUrl()
    @IsOptional()
    photoUrl?: string;
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
            role: { type: 'string', enum: Object.values(UserRole), example: UserRole.SECRETARY },
            photoUrl: { type: 'string', example: 'https://example.com/photo.jpg', nullable: true }
        }
    })
    user: {
        id: string;
        name: string;
        email: string;
        role: UserRole;
        photoUrl?: string;
    };
}

export class LogoutDto {
    @ApiProperty({ example: 'your-refresh-token' })
    @IsString()
    refreshToken: string;
}
