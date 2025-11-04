import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Inject,
  Scope,
  BadRequestException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { FilesService } from '../files/files.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  AuthResponseDto,
  ChangePasswordDto,
} from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { UserRole, LogoutReason } from '../../generated/prisma';
import { AuditService } from '../audit/audit.service';
import { UploadedFile } from '../files/interfaces/uploaded-file.interface';

/**
 * Interfaz para los metadatos de auditoría extraídos del request
 */
export interface AuditMetadata {
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Interfaz para la información básica de usuario
 */
interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
}

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditService: AuditService,
    private filesService: FilesService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  /**
   * Extraer metadatos de auditoría del request
   */
  private getAuditMetadata(): AuditMetadata {
    const auditMetadata = (
      this.request as Request & { auditMetadata?: AuditMetadata }
    ).auditMetadata;
    return {
      ipAddress: auditMetadata?.ipAddress,
      userAgent: auditMetadata?.userAgent,
    };
  }

  async register(
    registerDto: RegisterDto,
    photoFile?: UploadedFile,
  ): Promise<AuthResponseDto> {
    const { ipAddress, userAgent } = this.getAuditMetadata();
    const { email, password, name, role } = registerDto;

    const existingUser = await this.prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          role: role || UserRole.SECRETARY,
        },
        include: {
          photoFile: true,
        },
      });

      await tx.userAuth.create({
        data: {
          userId: user.id,
          passwordHash,
        },
      });

      // Si se proporcionó un archivo de foto, subirlo
      if (photoFile) {
        const uploadedFile = await this.filesService.uploadFile(
          photoFile,
          'user',
          user.id,
          'photo',
          user.id,
        );

        // Actualizar el usuario con el ID del archivo
        const updatedUser = await tx.user.update({
          where: { id: user.id },
          data: { photoFileId: uploadedFile.id },
          include: {
            photoFile: true,
          },
        });

        return updatedUser;
      }

      return user;
    });

    const tokens = this.generateTokens(result.id);
    await this.prisma.userAuth.update({
      where: { userId: result.id },
      data: {
        refreshToken: tokens.refreshToken,
        tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Log user creation
    await this.auditService.logUserCreated(
      result.id,
      result.email,
      result.name,
      undefined, // createdBy is undefined for self-registration
      undefined,
      undefined,
      undefined,
      ipAddress,
      userAgent,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role,
        photoFile: result.photoFile || null,
        isFirstLogin: result.isFirstLogin,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { ipAddress, userAgent } = this.getAuditMetadata();
    const { email, password } = loginDto;
    const user = await this.prisma.user.findFirst({
      where: { email, isDeleted: false },
      include: {
        userAuth: true,
        photoFile: true,
      },
    });

    if (!user || !user.userAuth) {
      // Log failed login attempt
      await this.auditService.logLoginFailed(
        email,
        'Invalid credentials',
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.userAuth.passwordHash,
    );
    if (!isPasswordValid) {
      // Log failed login attempt
      await this.auditService.logLoginFailed(
        email,
        'Invalid password',
        ipAddress,
        userAgent,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = this.generateTokens(user.id);

    await this.prisma.userAuth.update({
      where: { userId: user.id },
      data: {
        refreshToken: tokens.refreshToken,
        tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Create session log
    const sessionLog = await this.auditService.createSession({
      user_id: user.id,
      ip_address: ipAddress || 'unknown',
      user_agent: userAgent || 'unknown',
    });

    // Log successful login
    await this.auditService.logLogin(
      user.id,
      user.email,
      user.name,
      user.role,
      ipAddress,
      userAgent,
      sessionLog.id,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        photoFile: user.photoFile || null,
        isFirstLogin: user.isFirstLogin,
      },
    };
  }

  async refresh(refreshDto: RefreshTokenDto): Promise<AuthResponseDto> {
    const { ipAddress, userAgent } = this.getAuditMetadata();
    const { refreshToken } = refreshDto;

    try {
      this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const userAuth = await this.prisma.userAuth.findFirst({
        where: {
          refreshToken,
          tokenExpiry: { gt: new Date() },
        },
        include: {
          user: {
            include: {
              photoFile: true,
            },
          },
        },
      });

      if (!userAuth || userAuth.user.isDeleted) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = this.generateTokens(userAuth.userId);

      await this.prisma.userAuth.update({
        where: { userId: userAuth.userId },
        data: {
          refreshToken: tokens.refreshToken,
          tokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // Log token refresh
      await this.auditService.logTokenRefresh(
        userAuth.user.id,
        userAuth.user.email,
        userAuth.user.name,
        userAuth.user.role,
        ipAddress,
        userAgent,
      );

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: userAuth.user.id,
          name: userAuth.user.name,
          email: userAuth.user.email,
          role: userAuth.user.role,
          photoFile: userAuth.user.photoFile || null,
          isFirstLogin: userAuth.user.isFirstLogin,
        },
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(
    refreshToken: string,
    userId?: string,
  ): Promise<{ message: string }> {
    const { ipAddress, userAgent } = this.getAuditMetadata();
    // Get user info from refresh token if userId not provided
    let user: UserInfo | null = null;
    if (userId) {
      const foundUser = await this.prisma.user.findFirst({
        where: { id: userId },
      });
      if (foundUser) {
        user = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          role: foundUser.role,
        };
      }
    } else {
      const userAuth = await this.prisma.userAuth.findFirst({
        where: { refreshToken },
        include: { user: true },
      });
      if (userAuth) {
        user = {
          id: userAuth.user.id,
          email: userAuth.user.email,
          name: userAuth.user.name,
          role: userAuth.user.role,
        };
      }
    }

    // Clear refresh token
    await this.prisma.userAuth.updateMany({
      where: { refreshToken },
      data: {
        refreshToken: null,
        tokenExpiry: null,
      },
    });

    // If user found, log the logout and close session
    if (user) {
      // Get active session
      const activeSession = await this.auditService.getActiveSession(user.id);

      if (activeSession) {
        // Close session
        await this.auditService.updateSession(activeSession.id, {
          logout_at: new Date(),
          is_active: false,
          logout_reason: LogoutReason.USER_LOGOUT,
        });

        // Log logout
        await this.auditService.logLogout(
          user.id,
          user.email,
          user.name,
          user.role,
          LogoutReason.USER_LOGOUT,
          ipAddress,
          userAgent,
          activeSession.id,
        );
      }
    }

    return { message: 'Logged out successfully' };
  }

  /**
   * Cambia la contraseña del usuario autenticado
   */
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { ipAddress, userAgent } = this.getAuditMetadata();
    const { currentPassword, newPassword } = changePasswordDto;

    // Verificar que el usuario existe
    const user = await this.prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Obtener el registro de autenticación
    const userAuth = await this.prisma.userAuth.findUnique({
      where: { userId },
    });

    if (!userAuth) {
      throw new NotFoundException('User authentication record not found');
    }

    // Verificar la contraseña actual
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      userAuth.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Validar que la nueva contraseña sea diferente
    const isSamePassword = await bcrypt.compare(
      newPassword,
      userAuth.passwordHash,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    // Hash de la nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Actualizar la contraseña y marcar isFirstLogin como false
    await this.prisma.$transaction(async (tx) => {
      await tx.userAuth.update({
        where: { userId },
        data: {
          passwordHash: newPasswordHash,
          updatedBy: userId,
        },
      });

      // Si es el primer login, actualizar el flag
      if (user.isFirstLogin) {
        await tx.user.update({
          where: { id: userId },
          data: { isFirstLogin: false },
        });
      }
    });

    // Log del cambio de contraseña
    await this.auditService.logActivity({
      user_id: user.id,
      user_email: user.email,
      user_name: user.name,
      user_role: user.role,
      action: 'PASSWORD_CHANGED',
      entity_type: 'USER',
      entity_id: user.id,
      status: 'SUCCESS',
      severity: 'INFO',
      description: 'User changed their password',
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return { message: 'Password changed successfully' };
  }

  private generateTokens(userId: string): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload = { sub: userId };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });
    return { accessToken, refreshToken };
  }
}
