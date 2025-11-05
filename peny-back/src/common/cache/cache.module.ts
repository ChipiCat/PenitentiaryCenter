import { Module, Global } from '@nestjs/common';
import { CacheService } from './cache.service';

/**
 * Módulo global de cache
 * Se puede inyectar en cualquier servicio sin necesidad de importarlo
 */
@Global()
@Module({
  providers: [CacheService],
  exports: [CacheService],
})
export class CacheModule {}
