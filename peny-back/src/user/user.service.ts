import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
  PaginationQueryDto,
} from './dto/user.dto';
import { IPaginatedResponse } from '../common/interfaces/entity.interface';
import { User, UserRole } from '../../generated/prisma';
import * as bcrypt from 'bcryptjs';
import { AuditService } from '../audit/audit.service';

/**
 * Interfaz para los metadatos de auditoría extraídos del request
 */
export interface AuditMetadata {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
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

  async create(
    createUserDto: CreateUserDto,
    createdBy?: string,
  ): Promise<User> {
    const { ipAddress, userAgent } = this.getAuditMetadata();
    const { email, password, name, role, photoUrl } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user and auth record in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          role: role || UserRole.SECRETARY,
          photoUrl,
          createdBy,
        },
      });

      await tx.userAuth.create({
        data: {
          userId: user.id,
          passwordHash,
          createdBy,
        },
      });

      return user;
    });

    // Get creator info if createdBy provided
    let creatorInfo: {
      id: string;
      email: string;
      name: string;
      role: string;
    } | null = null;
    if (createdBy) {
      const creator = await this.prisma.user.findFirst({
        where: { id: createdBy },
      });
      if (creator) {
        creatorInfo = {
          id: creator.id,
          email: creator.email,
          name: creator.name,
          role: creator.role,
        };
      }
    }

    // Log user creation
    await this.auditService.logUserCreated(
      result.id,
      result.email,
      result.name,
      creatorInfo?.id,
      creatorInfo?.email,
      creatorInfo?.name,
      creatorInfo?.role,
      ipAddress,
      userAgent,
    );

    return result;
  }

  async findAll(query: PaginationQueryDto): Promise<IPaginatedResponse<User>> {
    const { page = 1, size = 10, search, role } = query;
    const skip = (page - 1) * size;

    type UserWhere = {
      isDeleted: boolean;
      OR?: Array<
        | { name: { contains: string; mode: 'insensitive' } }
        | { email: { contains: string; mode: 'insensitive' } }
      >;
      role?: UserRole;
    };
    const where: UserWhere = { isDeleted: false };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: size,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / size);

    return {
      data: users,
      page,
      size,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { id, isDeleted: false },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    updatedBy?: string,
  ): Promise<User> {
    const { ipAddress, userAgent } = this.getAuditMetadata();
    const { email, name, role, photoUrl } = updateUserDto;

    // Check if user exists
    const existingUser = await this.findOne(id);

    // If email is being updated, check for conflicts
    if (email && email !== existingUser.email) {
      const emailExists = await this.prisma.user.findFirst({
        where: { email },
      });

      if (emailExists) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(role && { role }),
        ...(photoUrl !== undefined && { photoUrl }),
        updatedBy,
      },
    });

    // Get updater info if updatedBy provided
    let updaterInfo: {
      id: string;
      email: string;
      name: string;
      role: string;
    } | null = null;
    if (updatedBy) {
      const updater = await this.prisma.user.findFirst({
        where: { id: updatedBy },
      });
      if (updater) {
        updaterInfo = {
          id: updater.id,
          email: updater.email,
          name: updater.name,
          role: updater.role,
        };
      }
    }

    // Build field-level changes array for DataChangeLog
    const fieldChanges: Array<{
      field_name: string;
      old_value?: string;
      new_value?: string;
    }> = [];

    if (name && name !== existingUser.name) {
      fieldChanges.push({
        field_name: 'name',
        old_value: existingUser.name,
        new_value: name,
      });
    }

    if (email && email !== existingUser.email) {
      fieldChanges.push({
        field_name: 'email',
        old_value: existingUser.email,
        new_value: email,
      });
    }

    if (role && role !== existingUser.role) {
      fieldChanges.push({
        field_name: 'role',
        old_value: existingUser.role,
        new_value: role,
      });
    }

    if (photoUrl !== undefined && photoUrl !== existingUser.photoUrl) {
      fieldChanges.push({
        field_name: 'photoUrl',
        old_value: existingUser.photoUrl ?? 'null',
        new_value: photoUrl ?? 'null',
      });
    }

    // Log user update with field-level changes if updatedBy is provided
    if (updatedBy && fieldChanges.length > 0) {
      await this.auditService.logUserUpdatedWithChanges(
        updatedUser.id,
        updatedUser.email,
        updatedUser.name,
        updatedBy,
        updaterInfo?.email,
        updaterInfo?.name,
        updaterInfo?.role,
        fieldChanges,
        ipAddress,
        userAgent,
      );
    }

    return updatedUser;
  }

  async remove(id: string, updatedBy?: string): Promise<{ message: string }> {
    const { ipAddress, userAgent } = this.getAuditMetadata();
    // Check if user exists
    const user = await this.findOne(id);

    // Soft delete
    await this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedBy,
      },
    });

    // Get deleter info if updatedBy provided
    let deleterInfo: {
      id: string;
      email: string;
      name: string;
      role: string;
    } | null = null;
    if (updatedBy) {
      const deleter = await this.prisma.user.findFirst({
        where: { id: updatedBy },
      });
      if (deleter) {
        deleterInfo = {
          id: deleter.id,
          email: deleter.email,
          name: deleter.name,
          role: deleter.role,
        };
      }
    }

    // Log user deletion
    await this.auditService.logUserDeleted(
      user.id,
      user.email,
      user.name,
      deleterInfo?.id,
      deleterInfo?.email,
      deleterInfo?.name,
      deleterInfo?.role,
      ipAddress,
      userAgent,
    );

    return { message: 'User deleted successfully' };
  }
}
