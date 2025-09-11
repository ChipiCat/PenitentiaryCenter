import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private heartbeatTimer?: NodeJS.Timeout;
  private reconnecting = false;
  private shuttingDown = false;

  async onModuleInit() {
    await this.connectWithRetry();
    this.startHeartbeat();
    this.setupSignals();
  }

  private async connectWithRetry() {
    const maxRetries = parseInt(process.env.PRISMA_MAX_RETRIES || '5', 10);
    const initialDelay = parseInt(
      process.env.PRISMA_RETRY_DELAY_MS || '2000',
      10,
    ); // 2s
    const maxDelay = parseInt(process.env.PRISMA_MAX_DELAY_MS || '15000', 10); // 15s cap

    let attempt = 0;
    let delay = initialDelay;

    while (attempt <= maxRetries) {
      try {
        attempt++;
        this.logger.log(
          `Prisma connecting (attempt ${attempt}/${maxRetries})...`,
        );
        await this.$connect();
        this.logger.log('Prisma connected successfully.');
        return;
      } catch (error) {
        this.logger.error(
          `Prisma connection failed (attempt ${attempt}): ${(error as Error).message}`,
        );
        if (attempt >= maxRetries) {
          this.logger.error(
            'Max Prisma connection retries reached. Exiting process.',
          );
          throw error;
        }
        const jitter = Math.floor(Math.random() * 300);
        await new Promise((res) => setTimeout(res, delay + jitter));
        delay = Math.min(delay * 2, maxDelay);
      }
    }
  }


  private startHeartbeat() {
    const intervalMs = parseInt(
      process.env.PRISMA_HEARTBEAT_INTERVAL_MS || '60000',
      10,
    );
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      if (this.shuttingDown) return;
      (async () => {
        try {
          await this.$queryRawUnsafe('SELECT 1');
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          this.logger.warn(`Heartbeat failed: ${msg}`);
          await this.tryReconnect();
        }
      })().catch((innerErr) => {
        const msg =
          innerErr instanceof Error ? innerErr.message : String(innerErr);
        this.logger.error(`Heartbeat unexpected failure: ${msg}`);
      });
    }, intervalMs);
  }

  private async tryReconnect() {
    if (this.reconnecting || this.shuttingDown) return;
    this.reconnecting = true;
    this.logger.warn(
      'Attempting to reconnect Prisma after detected disconnection...',
    );
    try {
      await this.connectWithRetry();
      this.logger.log('Reconnection successful.');
    } catch (err) {
      this.logger.error(
        `Reconnection attempts failed: ${(err as Error).message}`,
      );
    } finally {
      this.reconnecting = false;
    }
  }

  private setupSignals() {
    const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
    signals.forEach((sig) => {
      process.on(sig, () => {
        if (this.shuttingDown) return;
        this.shuttingDown = true;
        this.logger.log(`Received ${sig}. Graceful shutdown...`);
        (async () => {
          try {
            await this.onModuleDestroy();
          } catch (e) {
            this.logger.error('Error during shutdown', e as Error);
          } finally {
            process.exit(0);
          }
        })().catch((err) => {
          const msg = err instanceof Error ? err.message : String(err);
          this.logger.error(`Fatal during shutdown: ${msg}`);
          process.exit(1);
        });
      });
    });
  }

  async onModuleDestroy() {
    this.shuttingDown = true;
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    try {
      await this.$disconnect();
      this.logger.log('Prisma disconnected cleanly.');
    } catch (err) {
      this.logger.error(
        `Error disconnecting Prisma: ${(err as Error).message}`,
      );
    }
  }

  // Helper method for soft delete (no need for async keyword since we return a Promise directly)
  softDelete<M extends keyof PrismaClient, R = unknown>(
    model: M,
    id: string,
    updatedBy?: string,
  ): Promise<R> {
    const delegate = (
      this as unknown as Record<string, { update: (args: any) => Promise<R> }>
    )[model as string];
    if (!delegate || typeof delegate.update !== 'function') {
      throw new Error(`Model '${String(model)}' does not support update`);
    }
    return delegate.update({
      where: { id },
      data: {
        isDeleted: true,
        updatedBy,
        updatedAt: new Date(),
      },
    });
  }

  // Helper method to filter out soft deleted records
  findManyWithoutDeleted<M extends keyof PrismaClient, R = unknown>(
    model: M,
    args: { where?: Record<string, unknown>; [key: string]: unknown } = {},
  ): Promise<R[]> {
    const delegate = (
      this as unknown as Record<
        string,
        { findMany: (args: any) => Promise<R[]> }
      >
    )[model as string];
    if (!delegate || typeof delegate.findMany !== 'function') {
      throw new Error(`Model '${String(model)}' does not support findMany`);
    }
    const where = { ...(args.where ?? {}), isDeleted: false };
    return delegate.findMany({ ...args, where });
  }

  findUniqueWithoutDeleted<M extends keyof PrismaClient, R = unknown>(
    model: M,
    args: { where?: Record<string, unknown>; [key: string]: unknown },
  ): Promise<R | null> {
    const delegate = (
      this as unknown as Record<
        string,
        { findUnique: (args: any) => Promise<R | null> }
      >
    )[model as string];
    if (!delegate || typeof delegate.findUnique !== 'function') {
      throw new Error(`Model '${String(model)}' does not support findUnique`);
    }
    const where = { ...(args?.where ?? {}), isDeleted: false };
    return delegate.findUnique({ ...args, where });
  }
}
