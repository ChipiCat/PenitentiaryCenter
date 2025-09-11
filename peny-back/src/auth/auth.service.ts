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
import { UserRole } from '../../generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, name, role, photoUrl } = registerDto;
    const existingUser = await this.prisma.user.findUnique({
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

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findUnique({
      where: { email, isDeleted: false },
      include: { userAuth: true },
    });

    if (!user || !user.userAuth) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.userAuth.passwordHash,
    );
    if (!isPasswordValid) {
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

  async refresh(refreshDto: RefreshTokenDto): Promise<AuthResponseDto> {
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

  async logout(refreshToken: string): Promise<{ message: string }> {
    await this.prisma.userAuth.updateMany({
      where: { refreshToken },
      data: {
        refreshToken: null,
        tokenExpiry: null,
      },
    });

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
    const user = await this.prisma.user.findUnique({
      where: { id: userId, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
