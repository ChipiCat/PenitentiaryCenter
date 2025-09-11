import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // Helper method for soft delete
  async softDelete(model: string, id: string, updatedBy?: string) {
    return this[model].update({
      where: { id },
      data: {
        isDeleted: true,
        updatedBy,
        updatedAt: new Date(),
      },
    });
  }

  // Helper method to filter out soft deleted records
  async findManyWithoutDeleted(model: string, args: any = {}) {
    return this[model].findMany({
      ...args,
      where: {
        ...args.where,
        isDeleted: false,
      },
    });
  }

  async findUniqueWithoutDeleted(model: string, args: any) {
    return this[model].findUnique({
      ...args,
      where: {
        ...args.where,
        isDeleted: false,
      },
    });
  }
}
