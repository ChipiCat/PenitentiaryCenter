import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  AuthResponseDto,
} from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { UserRole, LogoutReason } from '../../generated/prisma';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async register(
    registerDto: RegisterDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    const { email, password, name, role, photoUrl } = registerDto;
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
          photoUrl,
        },
      });

      await tx.userAuth.create({
        data: {
          userId: user.id,
          passwordHash,
        },
      });

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
        photoUrl: result.photoUrl || undefined,
      },
    };
  }

  async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findFirst({
      where: { email, isDeleted: false },
      include: { userAuth: true },
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
        photoUrl: user.photoUrl || 'hola',
      },
    };
  }

  async refresh(
    refreshDto: RefreshTokenDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
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
        include: { user: true },
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
          photoUrl: userAuth.user.photoUrl || undefined,
        },
      };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(
    refreshToken: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string }> {
    // Get user info from refresh token if userId not provided
    let user: { id: string; email: string; name: string; role: string } | null =
      null;
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

  private generateTokens(userId: string) {
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

  async validateUser(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
