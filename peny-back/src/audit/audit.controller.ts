import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuditService } from './audit.service';
import {
  ActivityLogsQueryDto,
  FieldHistoryQueryDto,
  ErrorStatsQueryDto,
  GlobalSearchQueryDto,
} from './dto/query.dto';
import {
  ActivityLogsResponseDto,
  ActivityLogResponseDto,
  PrisonerTimelineResponseDto,
  IdentityHistoryResponseDto,
  FieldHistoryResponseDto,
  ActiveSessionsResponseDto,
  SystemStatsResponseDto,
  UserStatsResponseDto,
  ErrorStatsResponseDto,
  GlobalSearchResponseDto,
} from './dto/response.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

import { CacheInterceptor } from '@nestjs/cache-manager';

/**
 * Controlador para endpoints de auditoría y trazabilidad
 */

@ApiBearerAuth()
@Controller('audit')
@UseGuards(JwtAuthGuard)
@UseInterceptors(CacheInterceptor)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * GET /api/audit/activity-logs
   * Ver toda la actividad del sistema con filtros avanzados
   */
  @Get('activity-logs')
  @HttpCode(HttpStatus.OK)
  async getActivityLogs(
    @Query() query: ActivityLogsQueryDto,
  ): Promise<ActivityLogsResponseDto> {
    return this.auditService.getActivityLogs(query);
  }

  /**
   * GET /api/audit/activity-logs/:id
   * Ver detalles completos de una actividad específica
   */
  @Get('activity-logs/:id')
  @HttpCode(HttpStatus.OK)
  async getActivityLogById(
    @Param('id') id: string,
  ): Promise<ActivityLogResponseDto> {
    return this.auditService.getActivityLogById(id);
  }

  /**
   * GET /api/audit/prisoner/:prisonerId/timeline
   * Ver TODA la historia de un prisionero específico
   */
  @Get('prisoner/:prisonerId/timeline')
  @HttpCode(HttpStatus.OK)
  async getPrisonerTimeline(
    @Param('prisonerId') prisonerId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
    @Query('action') action?: string,
    @Query('module') module?: string,
  ): Promise<PrisonerTimelineResponseDto> {
    return this.auditService.getPrisonerTimeline(prisonerId, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
      startDate,
      endDate,
      action,
      module,
    });
  }

  /**
   * GET /api/audit/prisoner/:prisonerId/identity/history
   * Historial específico de cambios en identidad
   */
  @Get('prisoner/:prisonerId/identity/history')
  @HttpCode(HttpStatus.OK)
  async getPrisonerIdentityHistory(
    @Param('prisonerId') prisonerId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ): Promise<IdentityHistoryResponseDto> {
    return this.auditService.getPrisonerIdentityHistory(prisonerId, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
      startDate,
      endDate,
    });
  }

  /**
   * GET /api/audit/prisoner/:prisonerId/field/:fieldName/history
   * Historial de UN campo específico
   * Ejemplo: /api/audit/prisoner/prisoner_123/field/surname/history
   */
  @Get('prisoner/:prisonerId/field/:fieldName/history')
  @HttpCode(HttpStatus.OK)
  async getFieldHistory(
    @Param('prisonerId') prisonerId: string,
    @Param('fieldName') fieldName: string,
    @Query() query: FieldHistoryQueryDto,
  ): Promise<FieldHistoryResponseDto> {
    return this.auditService.getFieldHistory(prisonerId, fieldName, query);
  }

  /**
   * GET /api/audit/sessions/active
   * Ver sesiones activas en el sistema
   */
  @Get('sessions/active')
  @HttpCode(HttpStatus.OK)
  async getActiveSessions(): Promise<ActiveSessionsResponseDto> {
    return this.auditService.getActiveSessions();
  }

  /**
   * GET /api/audit/stats/system
   * Estadísticas generales del sistema
   * Incluye: resumen, breakdown por acción/módulo/status/severity, trends, top users, errores
   */
  @Get('stats/system')
  @HttpCode(HttpStatus.OK)
  async getSystemStats(): Promise<SystemStatsResponseDto> {
    return this.auditService.getSystemStats();
  }

  /**
   * GET /api/audit/stats/user/:userId
   * Estadísticas de actividad de un usuario específico
   * Incluye: resumen, breakdown, trends, actividades recientes, resumen de sesiones
   */
  @Get('stats/user/:userId')
  @HttpCode(HttpStatus.OK)
  async getUserStats(
    @Param('userId') userId: string,
  ): Promise<UserStatsResponseDto> {
    return this.auditService.getUserStats(userId);
  }

  /**
   * GET /api/audit/stats/errors
   * Análisis de errores del sistema
   * Query params: severity, startDate, endDate, groupBy (action|module|user)
   */
  @Get('stats/errors')
  @HttpCode(HttpStatus.OK)
  async getErrorStats(
    @Query() query: ErrorStatsQueryDto,
  ): Promise<ErrorStatsResponseDto> {
    return this.auditService.getErrorStats(query);
  }

  /**
   * GET /api/audit/search
   * Búsqueda global en logs de auditoría
   * Query params: q (término), searchIn (description|metadata|userEmail), filters, pagination
   */
  @Get('search')
  @HttpCode(HttpStatus.OK)
  async globalSearch(
    @Query() query: GlobalSearchQueryDto,
  ): Promise<GlobalSearchResponseDto> {
    return this.auditService.globalSearch(query);
  }
}
