import { Injectable, Logger } from '@nestjs/common';
import NodeCache from 'node-cache';

/**
 * Servicio de cache en memoria usando node-cache
 * Ideal para aplicaciones empaquetadas con Electron (sin Redis)
 */
@Injectable()
export class CacheService {
  private readonly cache: NodeCache;
  private readonly logger = new Logger(CacheService.name);

  constructor() {
    this.cache = new NodeCache({
      stdTTL: 300, // 5 minutos por defecto
      checkperiod: 60, // Revisar cada 60 segundos
      useClones: false, // Mejor performance (no clonar objetos)
      deleteOnExpire: true,
      maxKeys: 1000, // Máximo 1000 entradas
    });

    this.logger.log('Cache service initialized with 5min TTL');
  }

  /**
   * Obtiene un valor del cache
   */
  get<T>(key: string): T | undefined {
    const value = this.cache.get<T>(key);
    if (value !== undefined) {
      this.logger.debug(`Cache HIT: ${key}`);
    } else {
      this.logger.debug(`Cache MISS: ${key}`);
    }
    return value;
  }

  /**
   * Guarda un valor en el cache
   */
  set<T>(key: string, value: T, ttl?: number): boolean {
    const success = this.cache.set(key, value, ttl || 300);
    if (success) {
      this.logger.debug(`Cache SET: ${key} (TTL: ${ttl || 300}s)`);
    }
    return success;
  }

  /**
   * Elimina una clave específica del cache
   */
  del(key: string): number {
    const deleted = this.cache.del(key);
    if (deleted > 0) {
      this.logger.debug(`Cache DEL: ${key}`);
    }
    return deleted;
  }

  /**
   * Elimina múltiples claves que coincidan con un patrón
   */
  delPattern(pattern: string): number {
    const keys = this.cache.keys();
    const matchingKeys = keys.filter((key) => key.includes(pattern));
    const deleted = this.cache.del(matchingKeys);
    if (deleted > 0) {
      this.logger.debug(`Cache DEL Pattern: ${pattern} (${deleted} keys)`);
    }
    return deleted;
  }

  /**
   * Limpia todo el cache
   */
  flush(): void {
    this.cache.flushAll();
    this.logger.log('Cache flushed');
  }

  /**
   * Obtiene todas las claves del cache
   */
  keys(): string[] {
    return this.cache.keys();
  }

  /**
   * Verifica si una clave existe
   */
  has(key: string): boolean {
    return this.cache.has(key);
  }

  /**
   * Obtiene estadísticas del cache
   */
  getStats(): NodeCache.Stats {
    return this.cache.getStats();
  }
}
