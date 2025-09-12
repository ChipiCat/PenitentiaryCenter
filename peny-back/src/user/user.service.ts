import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateUserDto,
  UpdateUserDto,
  PaginationQueryDto,
} from './dto/user.dto';
import { IPaginatedResponse } from '../common/interfaces/entity.interface';
import { User, UserRole } from '../../generated/prisma';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(
    createUserDto: CreateUserDto,
    createdBy?: string,
  ): Promise<User> {
    const { email, password, name, role, photoUrl } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
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
      items: users,
      page,
      size,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
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
    const { email, name, role, photoUrl } = updateUserDto;

    // Check if user exists
    const existingUser = await this.findOne(id);

    // If email is being updated, check for conflicts
    if (email && email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
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

    return updatedUser;
  }

  async remove(id: string, updatedBy?: string): Promise<{ message: string }> {
    // Check if user exists
    await this.findOne(id);

    // Soft delete
    await this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedBy,
      },
    });

    return { message: 'User deleted successfully' };
  }
}
