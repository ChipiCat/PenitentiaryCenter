import {
  Body,
  Controller,
  Post,
  UseGuards,
  Get,
  Request,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  LogoutDto,
  ChangePasswordDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { UploadedFile as UploadedFileType } from '../files/interfaces/uploaded-file.interface';

interface AuthenticatedRequest {
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    photoUrl?: string;
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    description: 'User registration data with optional photo',
    schema: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john@example.com' },
        password: { type: 'string', example: 'password123' },
        role: {
          type: 'string',
          enum: ['ADMIN', 'DIRECTOR', 'SECRETARY'],
          example: 'SECRETARY',
        },
        cellphone: { type: 'string', example: '+591 12345678' },
        ci: { type: 'string', example: '1234567' },
        department: { type: 'string', example: 'Santa Cruz' },
        departmentalDirectorateUnit: {
          type: 'string',
          example: 'Dirección Regional Norte',
        },
        photo: {
          type: 'string',
          format: 'binary',
          description: 'Profile photo file (optional, max 5MB, jpg/png)',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User registered successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid data or file.' })
  @ApiResponse({ status: 409, description: 'User already exists.' })
  async register(
    @Body() registerDto: RegisterDto,
    @UploadedFile() photo?: UploadedFileType,
  ) {
    return this.authService.register(registerDto, photo);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'User logged in.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Token refreshed.' })
  async refresh(@Body() refreshDto: RefreshTokenDto) {
    return this.authService.refresh(refreshDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Logout user' })
  @ApiBody({ type: LogoutDto })
  @ApiResponse({ status: 200, description: 'User logged out.' })
  async logout(
    @Body() logoutDto: LogoutDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    return this.authService.logout(logoutDto.refreshToken, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user profile.' })
  async getProfile(@Request() req: AuthenticatedRequest) {
    // Await a resolved Promise to satisfy require-await rule
    await Promise.resolve();
    const user = req.user ?? {};
    return {
      id: user.id ?? null,
      name: user.name ?? null,
      email: user.email ?? null,
      role: user.role ?? null,
      photoUrl: user.photoUrl ?? null,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Password changed successfully.' })
  @ApiResponse({ status: 401, description: 'Current password is incorrect.' })
  @ApiResponse({
    status: 400,
    description: 'New password must be different from current password.',
  })
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Request() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    return this.authService.changePassword(userId, changePasswordDto);
  }
}
