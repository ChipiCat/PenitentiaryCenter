import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsUrl, IsInt, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { UserRole } from 'generated/prisma';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
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

    @ApiProperty({ enum: UserRole, example: UserRole.SECRETARY })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;

    @ApiProperty({ example: 'https://example.com/photo.jpg' })
    @IsUrl()
    @IsOptional()
    photoUrl?: string;
}

export class UpdateUserDto {
    @ApiProperty({ example: 'John Doe', minLength: 2 })
    @IsString()
    @MinLength(2)
    @IsOptional()
    name?: string;

    @ApiProperty({ example: 'john@example.com' })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;

    @ApiProperty({ example: 'https://example.com/photo.jpg' })
    @IsUrl()
    @IsOptional()
    photoUrl?: string;
}

export class UserResponseDto {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    photoUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class PaginationQueryDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    size?: number = 10;

    @IsString()
    @IsOptional()
    search?: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}
