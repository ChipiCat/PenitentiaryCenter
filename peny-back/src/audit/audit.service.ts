import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ActivityLog,
  SessionLog,
  DataChangeLog,
  Prisma,
  AuditAction,
  AuditStatus,
  AuditSeverity,
  AuditModule as AuditModuleEnum,
  EntityType,
  LogoutReason,
} from '../../generated/prisma';
import { CreateActivityLogDto } from './dto/activity-log.dto';
import {
  CreateSessionLogDto,
  UpdateSessionLogDto,
} from './dto/session-log.dto';
import { CreateDataChangeLogDto } from './dto/data-change-log.dto';
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
  UserInfoDto,
  TimelineEventDto,
  IdentityChangeDto,
  FieldChangeDto,
  ActiveSessionDto,
  SystemStatsResponseDto,
  UserStatsResponseDto,
  ErrorStatsResponseDto,
  GlobalSearchResponseDto,
  SearchResultDto,
} from './dto/response.dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // ACTIVITY LOG METHODS
  // ============================================================

  /**
   * Create an activity log entry
   */
  async logActivity(dto: CreateActivityLogDto): Promise<ActivityLog> {
    try {
      const activityLog = await this.prisma.activityLog.create({
        data: {
          userId: dto.user_id,
          userEmail: dto.user_email,
          userName: dto.user_name,
          userRole: dto.user_role,
          action: dto.action,
          entityType: dto.entity_type,
          entityId: dto.entity_id,
          ipAddress: dto.ip_address,
          userAgent: dto.user_agent,
          description: dto.description,
          metadata: dto.metadata
            ? (dto.metadata as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          status: dto.status ?? AuditStatus.SUCCESS,
          errorMessage: dto.error_message,
          module: dto.module,
          severity: dto.severity ?? AuditSeverity.INFO,
          sessionLogId: dto.session_log_id,
          prisonerRelatedId: dto.prisoner_related_id,
        },
      });

      return activityLog;
    } catch (error) {
      this.logger.error('Failed to create activity log', error);
      throw error;
    }
  }

  /**
   * Log a successful login
   */
  async logLogin(
    userId: string,
    userEmail: string,
    userName: string,
    userRole: string,
    ipAddress?: string,
    userAgent?: string,
    sessionLogId?: string,
  ): Promise<ActivityLog> {
    return this.logActivity({
      user_id: userId,
      user_email: userEmail,
      user_name: userName,
      user_role: userRole,
      action: AuditAction.LOGIN,
      entity_type: EntityType.USER,
      entity_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      description: `User ${userEmail} logged in successfully`,
      status: AuditStatus.SUCCESS,
      module: AuditModuleEnum.AUTH,
      severity: AuditSeverity.INFO,
      session_log_id: sessionLogId,
    });
  }

  /**
   * Log a failed login attempt
   */
  async logLoginFailed(
    email: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ActivityLog> {
    return this.logActivity({
      user_email: email,
      action: AuditAction.LOGIN_FAILED,
      entity_type: EntityType.USER,
      ip_address: ipAddress,
      user_agent: userAgent,
      description: `Failed login attempt for ${email}: ${reason}`,
      status: AuditStatus.FAILED,
      error_message: reason,
      module: AuditModuleEnum.AUTH,
      severity: AuditSeverity.WARNING,
    });
  }

  /**
   * Log a logout
   */
  async logLogout(
    userId: string,
    userEmail: string,
    userName: string,
    userRole: string,
    logoutReason: LogoutReason,
    ipAddress?: string,
    userAgent?: string,
    sessionLogId?: string,
  ): Promise<ActivityLog> {
    return this.logActivity({
      user_id: userId,
      user_email: userEmail,
      user_name: userName,
      user_role: userRole,
      action: AuditAction.LOGOUT,
      entity_type: EntityType.USER,
      entity_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      description: `User ${userEmail} logged out (${logoutReason})`,
      status: AuditStatus.SUCCESS,
      module: AuditModuleEnum.AUTH,
      severity: AuditSeverity.INFO,
      session_log_id: sessionLogId,
      metadata: { logout_reason: logoutReason },
    });
  }

  /**
   * Log a token refresh
   */
  async logTokenRefresh(
    userId: string,
    userEmail: string,
    userName: string,
    userRole: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ActivityLog> {
    return this.logActivity({
      user_id: userId,
      user_email: userEmail,
      user_name: userName,
      user_role: userRole,
      action: AuditAction.TOKEN_REFRESHED,
      entity_type: EntityType.USER,
      entity_id: userId,
      ip_address: ipAddress,
      user_agent: userAgent,
      description: `User ${userEmail} refreshed authentication token`,
      status: AuditStatus.SUCCESS,
      module: AuditModuleEnum.AUTH,
      severity: AuditSeverity.INFO,
    });
  }

  /**
   * Log user creation
   */
  async logUserCreated(
    createdUserId: string,
    createdUserEmail: string,
    createdUserName: string,
    createdByUserId?: string,
    createdByUserEmail?: string,
    createdByUserName?: string,
    createdByUserRole?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ActivityLog> {
    return this.logActivity({
      user_id: createdByUserId,
      user_email: createdByUserEmail,
      user_name: createdByUserName,
      user_role: createdByUserRole,
      action: AuditAction.USER_CREATED,
      entity_type: EntityType.USER,
      entity_id: createdUserId,
      ip_address: ipAddress,
      user_agent: userAgent,
      description: `User ${createdUserEmail} (${createdUserName}) was created`,
      status: AuditStatus.SUCCESS,
      module: AuditModuleEnum.USERS,
      severity: AuditSeverity.INFO,
      metadata: {
        created_user_id: createdUserId,
        created_user_email: createdUserEmail,
        created_user_name: createdUserName,
      },
    });
  }

  /**
   * Log user update
   */
  async logUserUpdated(
    updatedUserId: string,
    updatedUserEmail: string,
    updatedUserName: string,
    updatedByUserId?: string,
    updatedByUserEmail?: string,
    updatedByUserName?: string,
    updatedByUserRole?: string,
    changes?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ActivityLog> {
    return this.logActivity({
      user_id: updatedByUserId,
      user_email: updatedByUserEmail,
      user_name: updatedByUserName,
      user_role: updatedByUserRole,
      action: AuditAction.USER_UPDATED,
      entity_type: EntityType.USER,
      entity_id: updatedUserId,
      ip_address: ipAddress,
      user_agent: userAgent,
      description: `User ${updatedUserEmail} (${updatedUserName}) was updated`,
      status: AuditStatus.SUCCESS,
      module: AuditModuleEnum.USERS,
      severity: AuditSeverity.INFO,
      metadata: {
        updated_user_id: updatedUserId,
        updated_user_email: updatedUserEmail,
        updated_user_name: updatedUserName,
        changes,
      },
    });
  }

  /**
   * Log user deletion (soft delete)
   */
  async logUserDeleted(
    deletedUserId: string,
    deletedUserEmail: string,
    deletedUserName: string,
    deletedByUserId?: string,
    deletedByUserEmail?: string,
    deletedByUserName?: string,
    deletedByUserRole?: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ActivityLog> {
    return this.logActivity({
      user_id: deletedByUserId,
      user_email: deletedByUserEmail,
      user_name: deletedByUserName,
      user_role: deletedByUserRole,
      action: AuditAction.USER_DELETED,
      entity_type: EntityType.USER,
      entity_id: deletedUserId,
      ip_address: ipAddress,
      user_agent: userAgent,
      description: `User ${deletedUserEmail} (${deletedUserName}) was deleted`,
      status: AuditStatus.SUCCESS,
      module: AuditModuleEnum.USERS,
      severity: AuditSeverity.WARNING,
      metadata: {
        deleted_user_id: deletedUserId,
        deleted_user_email: deletedUserEmail,
        deleted_user_name: deletedUserName,
      },
    });
  }

  // ============================================================
  // GENERIC ENTITY AUDIT METHODS
  // ============================================================

  /**
   * Generic method to log entity creation with field-level tracking
   */
  async logEntityCreated(
    action: AuditAction,
    entityType: EntityType,
    entityId: string,
    entityDescription: string,
    createdByUserId: string,
    module: AuditModuleEnum,
    createdByUserEmail?: string,
    createdByUserName?: string,
    createdByUserRole?: string,
    ipAddress?: string,
    userAgent?: string,
    prisonerRelatedId?: string,
  ): Promise<{ activityLog: ActivityLog }> {
    // Create activity log
    const activityLog = await this.logActivity({
      user_id: createdByUserId,
      user_email: createdByUserEmail,
      user_name: createdByUserName,
      user_role: createdByUserRole,
      action,
      entity_type: entityType,
      entity_id: entityId,
      ip_address: ipAddress,
      user_agent: userAgent,
      description: entityDescription,
      status: AuditStatus.SUCCESS,
      module,
      severity: AuditSeverity.INFO,
      prisoner_related_id: prisonerRelatedId,
    });

    return {
      activityLog,
    };
  }

  /**
   * Generic method to log entity update with field-level changes
   */
  async logEntityUpdated(
    action: AuditAction,
    entityType: EntityType,
    entityId: string,
    entityDescription: string,
    updatedByUserId: string,
    module: AuditModuleEnum,
    fieldChanges?: Array<{
      field_name: string;
      old_value?: string;
      new_value?: string;
    }>,
    updatedByUserEmail?: string,
    updatedByUserName?: string,
    updatedByUserRole?: string,
    ipAddress?: string,
    userAgent?: string,
    prisonerRelatedId?: string,
  ): Promise<{ activityLog: ActivityLog; dataChanges: DataChangeLog[] }> {
    // Create activity log
    const activityLog = await this.logActivity({
      user_id: updatedByUserId,
      user_email: updatedByUserEmail,
      user_name: updatedByUserName,
      user_role: updatedByUserRole,
      action,
      entity_type: entityType,
      entity_id: entityId,
      ip_address: ipAddress,
      user_agent: userAgent,
      description: entityDescription,
      status: AuditStatus.SUCCESS,
      module,
      severity: AuditSeverity.INFO,
      prisoner_related_id: prisonerRelatedId,
    });

    // Create data change logs if there are field changes
    const dataChanges: DataChangeLog[] = [];
    if (fieldChanges && fieldChanges.length > 0) {
      const changeLogDtos: CreateDataChangeLogDto[] = fieldChanges.map(
        (change) => ({
          activity_log_id: activityLog.id,
          entity_type: entityType,
          entity_id: entityId,
          field_name: change.field_name,
          old_value: change.old_value,
          new_value: change.new_value,
          changed_by: updatedByUserId,
          prisoner_related_id: prisonerRelatedId,
        }),
      );

      const createdChanges = await this.logDataChanges(changeLogDtos);
      dataChanges.push(...createdChanges);
    }

    return {
      activityLog,
      dataChanges,
    };
  }

  /**
   * Generic method to log entity deletion
   */
  async logEntityDeleted(
    action: AuditAction,
    entityType: EntityType,
    entityId: string,
    entityDescription: string,
    deletedByUserId: string,
    module: AuditModuleEnum,
    deletedByUserEmail?: string,
    deletedByUserName?: string,
    deletedByUserRole?: string,
    ipAddress?: string,
    userAgent?: string,
    prisonerRelatedId?: string,
  ): Promise<ActivityLog> {
    return this.logActivity({
      user_id: deletedByUserId,
      user_email: deletedByUserEmail,
      user_name: deletedByUserName,
      user_role: deletedByUserRole,
      action,
      entity_type: entityType,
      entity_id: entityId,
      ip_address: ipAddress,
      user_agent: userAgent,
      description: entityDescription,
      status: AuditStatus.SUCCESS,
      module,
      severity: AuditSeverity.WARNING,
      prisoner_related_id: prisonerRelatedId,
    });
  }

  // ============================================================
  // SESSION LOG METHODS
  // ============================================================

  /**
   * Create a session log entry (on login)
   */
  async createSession(dto: CreateSessionLogDto): Promise<SessionLog> {
    try {
      const sessionLog = await this.prisma.sessionLog.create({
        data: {
          userId: dto.user_id,
          ipAddress: dto.ip_address,
          userAgent: dto.user_agent,
          deviceInfo: dto.device_info,
          country: dto.country,
          city: dto.city,
          isActive: true,
        },
      });

      return sessionLog;
    } catch (error) {
      this.logger.error('Failed to create session log', error);
      throw error;
    }
  }

  /**
   * Update session log (on logout)
   */
  async updateSession(
    sessionId: string,
    dto: UpdateSessionLogDto,
  ): Promise<SessionLog> {
    try {
      const sessionLog = await this.prisma.sessionLog.update({
        where: { id: sessionId },
        data: {
          logoutAt: dto.logout_at,
          isActive: dto.is_active ?? false,
          logoutReason: dto.logout_reason,
        },
      });

      return sessionLog;
    } catch (error) {
      this.logger.error('Failed to update session log', error);
      throw error;
    }
  }

  /**
   * Get active session for a user
   */
  async getActiveSession(userId: string): Promise<SessionLog | null> {
    return this.prisma.sessionLog.findFirst({
      where: {
        userId,
        isActive: true,
      },
      orderBy: { loginAt: 'desc' },
    });
  }

  /**
   * Close all active sessions for a user
   */
  async closeAllUserSessions(
    userId: string,
    logoutReason: LogoutReason,
  ): Promise<number> {
    const result = await this.prisma.sessionLog.updateMany({
      where: {
        userId,
        isActive: true,
      },
      data: {
        isActive: false,
        logoutAt: new Date(),
        logoutReason,
      },
    });

    return result.count;
  }

  /**
   * Get session logs with filters
   */
  async getSessionLogs(filters: {
    userId?: string;
    isActive?: boolean;
    logoutReason?: LogoutReason;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    size?: number;
  }): Promise<{
    items: SessionLog[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  }> {
    const {
      userId,
      isActive,
      logoutReason,
      startDate,
      endDate,
      page = 1,
      size = 10,
    } = filters;

    const skip = (page - 1) * size;

    const where: Prisma.SessionLogWhereInput = {};

    if (userId) where.userId = userId;
    if (isActive !== undefined) where.isActive = isActive;
    if (logoutReason) where.logoutReason = logoutReason;

    if (startDate || endDate) {
      where.loginAt = {};
      if (startDate) where.loginAt.gte = startDate;
      if (endDate) where.loginAt.lte = endDate;
    }

    const [items, total] = await Promise.all([
      this.prisma.sessionLog.findMany({
        where,
        skip,
        take: size,
        orderBy: { loginAt: 'desc' },
      }),
      this.prisma.sessionLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / size);

    return {
      items,
      total,
      page,
      size,
      totalPages,
    };
  }

  // ============================================================
  // DATA CHANGE LOG METHODS
  // ============================================================

  /**
   * Create a data change log entry
   */
  async logDataChange(dto: CreateDataChangeLogDto): Promise<DataChangeLog> {
    try {
      const dataChangeLog = await this.prisma.dataChangeLog.create({
        data: {
          activityLogId: dto.activity_log_id,
          entityType: dto.entity_type,
          entityId: dto.entity_id,
          fieldName: dto.field_name,
          oldValue: dto.old_value,
          newValue: dto.new_value,
          changedBy: dto.changed_by,
          reason: dto.reason,
        },
      });

      return dataChangeLog;
    } catch (error) {
      this.logger.error('Failed to create data change log', error);
      throw error;
    }
  }

  /**
   * Create multiple data change logs in a transaction
   */
  async logDataChanges(
    dtos: CreateDataChangeLogDto[],
  ): Promise<DataChangeLog[]> {
    try {
      const dataChangeLogs = await this.prisma.$transaction(
        dtos.map((dto) =>
          this.prisma.dataChangeLog.create({
            data: {
              activityLogId: dto.activity_log_id,
              entityType: dto.entity_type,
              entityId: dto.entity_id,
              fieldName: dto.field_name,
              oldValue: dto.old_value,
              newValue: dto.new_value,
              changedBy: dto.changed_by,
              reason: dto.reason,
              prisonerRelatedId: dto.prisoner_related_id,
            },
          }),
        ),
      );

      return dataChangeLogs;
    } catch (error) {
      this.logger.error('Failed to create data change logs', error);
      throw error;
    }
  }

  /**
   * Log user update with field-level changes
   */
  async logUserUpdatedWithChanges(
    updatedUserId: string,
    updatedUserEmail: string,
    updatedUserName: string,
    updatedByUserId: string,
    updatedByUserEmail?: string,
    updatedByUserName?: string,
    updatedByUserRole?: string,
    fieldChanges?: Array<{
      field_name: string;
      old_value?: string;
      new_value?: string;
    }>,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ activityLog: ActivityLog; dataChanges: DataChangeLog[] }> {
    // Create activity log
    const activityLog = await this.logActivity({
      user_id: updatedByUserId,
      user_email: updatedByUserEmail,
      user_name: updatedByUserName,
      user_role: updatedByUserRole,
      action: AuditAction.USER_UPDATED,
      entity_type: EntityType.USER,
      entity_id: updatedUserId,
      ip_address: ipAddress,
      user_agent: userAgent,
      description: `User ${updatedUserEmail} (${updatedUserName}) was updated`,
      status: AuditStatus.SUCCESS,
      module: AuditModuleEnum.USERS,
      severity: AuditSeverity.INFO,
    });

    // Create data change logs if there are field changes
    const dataChanges: DataChangeLog[] = [];
    if (fieldChanges && fieldChanges.length > 0) {
      const changeLogDtos: CreateDataChangeLogDto[] = fieldChanges.map(
        (change) => ({
          activity_log_id: activityLog.id,
          entity_type: EntityType.USER,
          entity_id: updatedUserId,
          field_name: change.field_name,
          old_value: change.old_value,
          new_value: change.new_value,
          changed_by: updatedByUserId,
        }),
      );

      const createdChanges = await this.logDataChanges(changeLogDtos);
      dataChanges.push(...createdChanges);
    }

    return {
      activityLog,
      dataChanges,
    };
  }

  /**
   * Get data change logs with filters
   */
  async getDataChangeLogs(filters: {
    activityLogId?: string;
    entityType?: EntityType;
    entityId?: string;
    fieldName?: string;
    changedBy?: string;
    page?: number;
    size?: number;
  }): Promise<{
    items: DataChangeLog[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
  }> {
    const {
      activityLogId,
      entityType,
      entityId,
      fieldName,
      changedBy,
      page = 1,
      size = 10,
    } = filters;

    const skip = (page - 1) * size;

    const where: Prisma.DataChangeLogWhereInput = {};

    if (activityLogId) where.activityLogId = activityLogId;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (fieldName) where.fieldName = fieldName;
    if (changedBy) where.changedBy = changedBy;

    const [items, total] = await Promise.all([
      this.prisma.dataChangeLog.findMany({
        where,
        skip,
        take: size,
        orderBy: { changedAt: 'desc' },
        include: {
          activityLog: true,
        },
      }),
      this.prisma.dataChangeLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / size);

    return {
      items,
      total,
      page,
      size,
      totalPages,
    };
  }

  /**
   * Get change history for a specific entity
   */
  async getEntityChangeHistory(
    entityType: EntityType,
    entityId: string,
    fieldName?: string,
  ): Promise<DataChangeLog[]> {
    const where: Prisma.DataChangeLogWhereInput = {
      entityType,
      entityId,
    };

    if (fieldName) {
      where.fieldName = fieldName;
    }

    return this.prisma.dataChangeLog.findMany({
      where,
      orderBy: { changedAt: 'desc' },
      include: {
        activityLog: true,
      },
    });
  }

  // ============================================================
  // NEW QUERY ENDPOINTS FOR AUDIT CONTROLLER
  // ============================================================

  /**
   * Get activity logs with advanced filtering and pagination
   */
  async getActivityLogs(
    query: ActivityLogsQueryDto,
  ): Promise<ActivityLogsResponseDto> {
    const {
      page = 1,
      limit = 50,
      user_id,
      user_email,
      user_role,
      action,
      module,
      entity_type,
      entity_id,
      prisoner_related_id,
      status,
      severity,
      start_date,
      end_date,
      session_log_id,
      search,
      ip_address,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.ActivityLogWhereInput = {};

    if (user_id) where.userId = user_id;
    if (user_email)
      where.userEmail = { contains: user_email, mode: 'insensitive' };
    if (user_role) where.userRole = user_role;
    if (action) where.action = action;
    if (module) where.module = module;
    if (entity_type) where.entityType = entity_type;
    if (entity_id) where.entityId = entity_id;
    if (prisoner_related_id) where.prisonerRelatedId = prisoner_related_id;
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (session_log_id) where.sessionLogId = session_log_id;
    if (ip_address) where.ipAddress = ip_address;

    if (start_date || end_date) {
      where.timestamp = {};
      if (start_date) where.timestamp.gte = new Date(start_date);
      if (end_date) where.timestamp.lte = new Date(end_date);
    }

    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { userEmail: { contains: search, mode: 'insensitive' } },
        { userName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [activities, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          dataChanges: true,
          prisonerRelated: {
            select: {
              id: true,
              identity: {
                select: { surname: true, firstName: true },
              },
            },
          },
        },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: activities.map((activity) =>
        this.mapActivityLogToDto(
          activity as ActivityLog & {
            prisonerRelated?: {
              id: string;
              identity: {
                surname: string;
                firstName: string;
              };
            };
            dataChanges?: DataChangeLog[];
          },
        ),
      ),
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };
  }

  /**
   * Get a specific activity log by ID with all details
   */
  async getActivityLogById(id: string): Promise<ActivityLogResponseDto> {
    const activity = await this.prisma.activityLog.findFirst({
      where: { id },
      include: {
        dataChanges: true,
        sessionLog: true,
      },
    });

    if (!activity) {
      throw new NotFoundException(`Activity log with ID ${id} not found`);
    }

    return this.mapActivityLogToDto(activity);
  }

  /**
   * Get complete timeline for a specific prisoner
   */
  async getPrisonerTimeline(
    prisonerId: string,
    options: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      action?: string;
      module?: string;
    },
  ): Promise<PrisonerTimelineResponseDto> {
    const {
      page = 1,
      limit = 50,
      startDate,
      endDate,
      action,
      module,
    } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.ActivityLogWhereInput = {
      prisonerRelatedId: prisonerId,
    };

    if (action) where.action = action as AuditAction;
    if (module) where.module = module as AuditModuleEnum;

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const [activities, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          dataChanges: true,
        },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    // Get first and last events for summary
    const firstEvent = await this.prisma.activityLog.findFirst({
      where,
      orderBy: { timestamp: 'asc' },
    });

    const lastEvent = await this.prisma.activityLog.findFirst({
      where,
      orderBy: { timestamp: 'desc' },
    });

    // Calculate breakdowns
    const actionsBreakdown: Record<string, number> = {};
    const modulesBreakdown: Record<string, number> = {};

    const allActivities = await this.prisma.activityLog.findMany({
      where,
      select: { action: true, module: true },
    });

    allActivities.forEach((act) => {
      actionsBreakdown[act.action] = (actionsBreakdown[act.action] || 0) + 1;
      if (act.module) {
        modulesBreakdown[act.module] = (modulesBreakdown[act.module] || 0) + 1;
      }
    });

    const totalPages = Math.ceil(total / limit);

    return {
      prisoner_id: prisonerId,
      events: activities.map((activity) =>
        this.mapActivityToTimelineEvent(activity),
      ),
      summary: {
        total_events: total,
        date_range: {
          first_event: firstEvent?.timestamp.toISOString() || '',
          last_event: lastEvent?.timestamp.toISOString() || '',
        },
        actions_breakdown: actionsBreakdown,
        modules_breakdown: modulesBreakdown,
      },
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };
  }

  /**
   * Get identity change history for a prisoner
   */
  async getPrisonerIdentityHistory(
    prisonerId: string,
    options: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<IdentityHistoryResponseDto> {
    const { page = 1, limit = 50, startDate, endDate } = options;
    const skip = (page - 1) * limit;

    // Get the identity entity ID for this prisoner
    const identity = await this.prisma.prisonerIdentity.findFirst({
      where: { prisonerId },
    });

    if (!identity) {
      throw new NotFoundException(
        `Identity not found for prisoner ${prisonerId}`,
      );
    }

    const where: Prisma.ActivityLogWhereInput = {
      entityType: EntityType.PRISONER_IDENTITY,
      entityId: identity.id,
    };

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const [activities, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          dataChanges: true,
        },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    // Get all changes to build summary
    const allChanges = await this.prisma.dataChangeLog.findMany({
      where: {
        entityType: EntityType.PRISONER_IDENTITY,
        entityId: identity.id,
      },
      select: { fieldName: true, changedAt: true },
      orderBy: { changedAt: 'asc' },
    });

    const fieldsModified = [...new Set(allChanges.map((c) => c.fieldName))];
    const firstChange = allChanges[0];
    const lastChange = allChanges[allChanges.length - 1];

    const totalPages = Math.ceil(total / limit);

    return {
      prisoner_id: prisonerId,
      entity_type: 'PRISONER_IDENTITY',
      changes: activities.map((activity) =>
        this.mapActivityToIdentityChange(activity),
      ),
      summary: {
        total_changes: allChanges.length,
        fields_modified: fieldsModified,
        date_range: {
          first_change: firstChange?.changedAt.toISOString() || '',
          last_change: lastChange?.changedAt.toISOString() || '',
        },
      },
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };
  }

  /**
   * Get field-specific change history
   */
  async getFieldHistory(
    prisonerId: string,
    fieldName: string,
    query: FieldHistoryQueryDto,
  ): Promise<FieldHistoryResponseDto> {
    const { page = 1, limit = 50, start_date, end_date, changed_by } = query;
    const skip = (page - 1) * limit;

    // Find all entities related to this prisoner and get their changes for this field
    const where: Prisma.DataChangeLogWhereInput = {
      prisonerRelatedId: prisonerId,
      fieldName,
    };

    if (changed_by) where.changedBy = changed_by;

    if (start_date || end_date) {
      where.changedAt = {};
      if (start_date) where.changedAt.gte = new Date(start_date);
      if (end_date) where.changedAt.lte = new Date(end_date);
    }

    const [changes, total] = await Promise.all([
      this.prisma.dataChangeLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { changedAt: 'desc' },
        include: {
          activityLog: true,
        },
      }),
      this.prisma.dataChangeLog.count({ where }),
    ]);

    // Get unique editors count
    const allChanges = await this.prisma.dataChangeLog.findMany({
      where,
      select: { changedBy: true, changedAt: true },
      orderBy: { changedAt: 'asc' },
    });

    const uniqueEditors = [...new Set(allChanges.map((c) => c.changedBy))]
      .length;
    const firstChange = allChanges[0];
    const lastChange = allChanges[allChanges.length - 1];

    // Get current value (most recent change)
    const currentValue = changes[0]?.newValue;

    // Determine entity type from the first change
    const entityType = changes[0]?.entityType || EntityType.PRISONER;

    const totalPages = Math.ceil(total / limit);

    return {
      prisoner_id: prisonerId,
      entity_type: entityType,
      field_name: fieldName,
      current_value: currentValue || undefined,
      changes: await Promise.all(
        changes.map((change) => this.mapDataChangeToFieldChange(change)),
      ),
      summary: {
        total_changes: total,
        date_range: {
          first_change: firstChange?.changedAt.toISOString() || '',
          last_change: lastChange?.changedAt.toISOString() || '',
        },
        unique_editors: uniqueEditors,
      },
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
    };
  }

  /**
   * Get all active sessions
   */
  async getActiveSessions(): Promise<ActiveSessionsResponseDto> {
    const sessions = await this.prisma.sessionLog.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        loginAt: 'desc',
      },
    });

    // Get user info and activity counts for each session
    const sessionsWithDetails: ActiveSessionDto[] = await Promise.all(
      sessions.map(async (session) => {
        const user = await this.prisma.user.findFirst({
          where: { id: session.userId },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        });

        const activitiesCount = await this.prisma.activityLog.count({
          where: { sessionLogId: session.id },
        });

        const lastActivity = await this.prisma.activityLog.findFirst({
          where: { sessionLogId: session.id },
          orderBy: { timestamp: 'desc' },
        });

        const durationMinutes = Math.floor(
          (new Date().getTime() - session.loginAt.getTime()) / (1000 * 60),
        );

        return {
          id: session.id,
          user: user
            ? {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
              }
            : {
                id: session.userId,
                email: 'Unknown',
                name: 'Unknown',
                role: 'Unknown',
              },
          login_at: session.loginAt.toISOString(),
          ip_address: session.ipAddress,
          user_agent: session.userAgent,
          device_info: session.deviceInfo || undefined,
          country: session.country || undefined,
          city: session.city || undefined,
          duration_minutes: durationMinutes,
          last_activity: lastActivity?.timestamp.toISOString(),
          activities_count: activitiesCount,
        };
      }),
    );

    // Calculate summary
    const usersOnline = [...new Set(sessions.map((s) => s.userId))].length;
    const byRole: Record<string, number> = {};

    for (const session of sessionsWithDetails) {
      const role = session.user.role || 'Unknown';
      byRole[role] = (byRole[role] || 0) + 1;
    }

    return {
      sessions: sessionsWithDetails,
      summary: {
        total_active_sessions: sessions.length,
        users_online: usersOnline,
        by_role: byRole,
      },
    };
  }

  // ============================================================
  // HELPER MAPPERS
  // ============================================================

  private mapActivityLogToDto(
    activity: ActivityLog & {
      prisonerRelated?: {
        id: string;
        identity: {
          surname: string;
          firstName: string;
        };
      };
      dataChanges?: DataChangeLog[];
    },
  ): ActivityLogResponseDto {
    return {
      id: activity.id,
      user: activity.userId
        ? {
            id: activity.userId,
            email: activity.userEmail || undefined,
            name: activity.userName || undefined,
            role: activity.userRole || undefined,
          }
        : undefined,
      action: activity.action,
      entity_type: activity.entityType,
      entity_id: activity.entityId || undefined,
      timestamp: activity.timestamp.toISOString(),
      ip_address: activity.ipAddress || undefined,
      user_agent: activity.userAgent || undefined,
      description: activity.description,
      metadata: activity.metadata
        ? (activity.metadata as Record<string, any>)
        : undefined,
      status: activity.status,
      error_message: activity.errorMessage || undefined,
      module: activity.module || undefined,
      severity: activity.severity,
      prisoner_related_id: activity.prisonerRelatedId || undefined,
      prisoner_related: activity.prisonerRelated
        ? {
            id: activity.prisonerRelated.id,
            identity: {
              surname: activity.prisonerRelated.identity.surname,
              firstName: activity.prisonerRelated.identity.firstName,
            },
          }
        : undefined,
      session_log_id: activity.sessionLogId || undefined,
      data_changes: activity.dataChanges
        ? activity.dataChanges.map((change) => ({
            id: change.id,
            field_name: change.fieldName,
            old_value: change.oldValue || undefined,
            new_value: change.newValue || undefined,
            changed_by: change.changedBy,
            changed_at: change.changedAt.toISOString(),
            reason: change.reason || undefined,
          }))
        : undefined,
    };
  }

  private mapActivityToTimelineEvent(
    activity: ActivityLog & { dataChanges?: DataChangeLog[] },
  ): TimelineEventDto {
    return {
      id: activity.id,
      timestamp: activity.timestamp.toISOString(),
      action: activity.action,
      module: activity.module || undefined,
      entity_type: activity.entityType,
      entity_id: activity.entityId || undefined,
      description: activity.description,
      severity: activity.severity,
      status: activity.status,
      user: activity.userId
        ? {
            id: activity.userId,
            email: activity.userEmail || undefined,
            name: activity.userName || undefined,
            role: activity.userRole || undefined,
          }
        : undefined,
      changes: activity.dataChanges
        ? activity.dataChanges.map((change) => ({
            id: change.id,
            field_name: change.fieldName,
            old_value: change.oldValue || undefined,
            new_value: change.newValue || undefined,
            changed_by: change.changedBy,
            changed_at: change.changedAt.toISOString(),
            reason: change.reason || undefined,
          }))
        : undefined,
      ip_address: activity.ipAddress || undefined,
      user_agent: activity.userAgent || undefined,
      metadata: activity.metadata
        ? (activity.metadata as Record<string, any>)
        : undefined,
    };
  }

  private mapActivityToIdentityChange(
    activity: ActivityLog & { dataChanges?: DataChangeLog[] },
  ): IdentityChangeDto {
    const firstChange = activity.dataChanges?.[0];

    return {
      id: activity.id,
      timestamp: activity.timestamp.toISOString(),
      action: activity.action,
      field_name: firstChange?.fieldName,
      old_value: firstChange?.oldValue || undefined,
      new_value: firstChange?.newValue || undefined,
      changed_by: activity.userId || 'system',
      changed_by_user: activity.userId
        ? {
            id: activity.userId,
            email: activity.userEmail || undefined,
            name: activity.userName || undefined,
            role: activity.userRole || undefined,
          }
        : undefined,
      description: activity.description,
      ip_address: activity.ipAddress || undefined,
      user_agent: activity.userAgent || undefined,
    };
  }

  private async mapDataChangeToFieldChange(
    change: DataChangeLog & { activityLog?: ActivityLog | null },
  ): Promise<FieldChangeDto> {
    // Get user info if not already in activityLog
    let userInfo: UserInfoDto | undefined;
    if (change.activityLog?.userId) {
      userInfo = {
        id: change.activityLog.userId,
        email: change.activityLog.userEmail || undefined,
        name: change.activityLog.userName || undefined,
        role: change.activityLog.userRole || undefined,
      };
    } else {
      // Try to fetch user by changedBy
      const user = await this.prisma.user.findFirst({
        where: { id: change.changedBy },
        select: { id: true, email: true, name: true, role: true },
      });
      if (user) {
        userInfo = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    }

    return {
      id: change.id,
      timestamp: change.changedAt.toISOString(),
      old_value: change.oldValue || undefined,
      new_value: change.newValue || undefined,
      changed_by: change.changedBy,
      changed_by_user: userInfo,
      reason: change.reason || undefined,
      action: change.activityLog?.action || AuditAction.UPDATE,
      description:
        change.activityLog?.description || `Field ${change.fieldName} changed`,
      ip_address: change.activityLog?.ipAddress || undefined,
      activity_log_id: change.activityLogId || undefined,
    };
  }

  // ============================================================
  // STATISTICS AND ANALYTICS ENDPOINTS
  // ============================================================

  /**
   * Get comprehensive system statistics
   */
  async getSystemStats(): Promise<SystemStatsResponseDto> {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Overview stats
    const [
      totalActivities,
      totalDataChanges,
      totalSessions,
      activeSessions,
      firstActivity,
      lastActivity,
      uniqueUsers,
    ] = await Promise.all([
      this.prisma.activityLog.count(),
      this.prisma.dataChangeLog.count(),
      this.prisma.sessionLog.count(),
      this.prisma.sessionLog.count({ where: { isActive: true } }),
      this.prisma.activityLog.findFirst({ orderBy: { timestamp: 'asc' } }),
      this.prisma.activityLog.findFirst({ orderBy: { timestamp: 'desc' } }),
      this.prisma.activityLog
        .groupBy({
          by: ['userId'],
          where: { userId: { not: null } },
        })
        .then((groups) => groups.length),
    ]);

    // Activities breakdown
    const [byAction, byModule, byStatus, bySeverity] = await Promise.all([
      this.prisma.activityLog.groupBy({
        by: ['action'],
        _count: true,
      }),
      this.prisma.activityLog.groupBy({
        by: ['module'],
        where: { module: { not: null } },
        _count: true,
      }),
      this.prisma.activityLog.groupBy({
        by: ['status'],
        _count: true,
      }),
      this.prisma.activityLog.groupBy({
        by: ['severity'],
        _count: true,
      }),
    ]);

    // Trends
    const [activitiesLast24h, activitiesLast7d, activitiesLast30d] =
      await Promise.all([
        this.prisma.activityLog.count({
          where: { timestamp: { gte: last24h } },
        }),
        this.prisma.activityLog.count({
          where: { timestamp: { gte: last7d } },
        }),
        this.prisma.activityLog.count({
          where: { timestamp: { gte: last30d } },
        }),
      ]);

    // Top users
    const topUsersData = await this.prisma.activityLog.groupBy({
      by: ['userId', 'userEmail', 'userName', 'userRole'],
      where: { userId: { not: null } },
      _count: true,
      orderBy: { _count: { userId: 'desc' } },
      take: 10,
    });

    const topUsers = topUsersData.map((user) => ({
      user_id: user.userId || '',
      user_email: user.userEmail || '',
      user_name: user.userName || '',
      user_role: user.userRole || '',
      activity_count: user._count,
    }));

    // Error summary
    const [totalErrors, totalWarnings, totalCritical, errorsByModule] =
      await Promise.all([
        this.prisma.activityLog.count({
          where: { status: AuditStatus.FAILED },
        }),
        this.prisma.activityLog.count({
          where: { severity: AuditSeverity.WARNING },
        }),
        this.prisma.activityLog.count({
          where: { severity: AuditSeverity.CRITICAL },
        }),
        this.prisma.activityLog.groupBy({
          by: ['module'],
          where: {
            status: AuditStatus.FAILED,
            module: { not: null },
          },
          _count: true,
        }),
      ]);

    return {
      overview: {
        total_activities: totalActivities,
        total_data_changes: totalDataChanges,
        total_sessions: totalSessions,
        active_sessions: activeSessions,
        unique_users: uniqueUsers,
        date_range: {
          first_activity: firstActivity?.timestamp.toISOString() || '',
          last_activity: lastActivity?.timestamp.toISOString() || '',
        },
      },
      activities_breakdown: {
        by_action: Object.fromEntries(
          byAction.map((item) => [item.action, item._count]),
        ),
        by_module: Object.fromEntries(
          byModule.map((item) => [item.module || 'unknown', item._count]),
        ),
        by_status: Object.fromEntries(
          byStatus.map((item) => [item.status, item._count]),
        ),
        by_severity: Object.fromEntries(
          bySeverity.map((item) => [item.severity, item._count]),
        ),
      },
      trends: {
        last_24h: activitiesLast24h,
        last_7d: activitiesLast7d,
        last_30d: activitiesLast30d,
      },
      top_users: topUsers,
      error_summary: {
        total_errors: totalErrors,
        total_warnings: totalWarnings,
        total_critical: totalCritical,
        by_module: Object.fromEntries(
          errorsByModule.map((item) => [item.module || 'unknown', item._count]),
        ),
      },
    };
  }

  /**
   * Get user-specific statistics
   */
  async getUserStats(userId: string): Promise<UserStatsResponseDto> {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get user info
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Overview stats
    const [
      totalActivities,
      totalSessions,
      activeSessions,
      totalDataChanges,
      firstActivity,
      lastActivity,
    ] = await Promise.all([
      this.prisma.activityLog.count({ where: { userId } }),
      this.prisma.sessionLog.count({ where: { userId } }),
      this.prisma.sessionLog.count({ where: { userId, isActive: true } }),
      this.prisma.dataChangeLog.count({ where: { changedBy: userId } }),
      this.prisma.activityLog.findFirst({
        where: { userId },
        orderBy: { timestamp: 'asc' },
      }),
      this.prisma.activityLog.findFirst({
        where: { userId },
        orderBy: { timestamp: 'desc' },
      }),
    ]);

    // Activities breakdown
    const [byAction, byModule, byStatus, byEntityType] = await Promise.all([
      this.prisma.activityLog.groupBy({
        by: ['action'],
        where: { userId },
        _count: true,
      }),
      this.prisma.activityLog.groupBy({
        by: ['module'],
        where: { userId, module: { not: null } },
        _count: true,
      }),
      this.prisma.activityLog.groupBy({
        by: ['status'],
        where: { userId },
        _count: true,
      }),
      this.prisma.activityLog.groupBy({
        by: ['entityType'],
        where: { userId },
        _count: true,
      }),
    ]);

    // Trends
    const [activitiesLast24h, activitiesLast7d, activitiesLast30d] =
      await Promise.all([
        this.prisma.activityLog.count({
          where: { userId, timestamp: { gte: last24h } },
        }),
        this.prisma.activityLog.count({
          where: { userId, timestamp: { gte: last7d } },
        }),
        this.prisma.activityLog.count({
          where: { userId, timestamp: { gte: last30d } },
        }),
      ]);

    // Recent activities
    const recentActivities = await this.prisma.activityLog.findMany({
      where: { userId },
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: {
        dataChanges: true,
        prisonerRelated: {
          select: {
            id: true,
            identity: {
              select: { surname: true, firstName: true },
            },
          },
        },
      },
    });

    // Sessions summary
    const sessions = await this.prisma.sessionLog.findMany({
      where: { userId },
      orderBy: { loginAt: 'desc' },
    });

    const sessionDurations = sessions
      .filter((s) => s.logoutAt)
      .map((s) => s.logoutAt!.getTime() - s.loginAt.getTime());

    const avgSessionDuration =
      sessionDurations.length > 0
        ? sessionDurations.reduce((a, b) => a + b, 0) /
          sessionDurations.length /
          (1000 * 60)
        : 0;

    const ipCounts: Record<string, number> = {};
    sessions.forEach((s) => {
      ipCounts[s.ipAddress] = (ipCounts[s.ipAddress] || 0) + 1;
    });

    const mostUsedIp =
      Object.entries(ipCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    const lastLogin = sessions[0]?.loginAt.toISOString() || '';

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      overview: {
        total_activities: totalActivities,
        total_sessions: totalSessions,
        active_sessions: activeSessions,
        total_data_changes: totalDataChanges,
        date_range: {
          first_activity: firstActivity?.timestamp.toISOString() || '',
          last_activity: lastActivity?.timestamp.toISOString() || '',
        },
      },
      activities_breakdown: {
        by_action: Object.fromEntries(
          byAction.map((item) => [item.action, item._count]),
        ),
        by_module: Object.fromEntries(
          byModule.map((item) => [item.module || 'unknown', item._count]),
        ),
        by_status: Object.fromEntries(
          byStatus.map((item) => [item.status, item._count]),
        ),
        by_entity_type: Object.fromEntries(
          byEntityType.map((item) => [item.entityType, item._count]),
        ),
      },
      trends: {
        last_24h: activitiesLast24h,
        last_7d: activitiesLast7d,
        last_30d: activitiesLast30d,
      },
      recent_activities: recentActivities.map((activity) =>
        this.mapActivityLogToDto({
          ...activity,
          prisonerRelated:
            activity.prisonerRelated && activity.prisonerRelated.identity
              ? {
                  id: activity.prisonerRelated.id,
                  identity: {
                    surname: activity.prisonerRelated.identity.surname,
                    firstName: activity.prisonerRelated.identity.firstName,
                  },
                }
              : undefined,
        }),
      ),
      sessions_summary: {
        average_session_duration_minutes: Math.round(avgSessionDuration),
        total_login_count: totalSessions,
        last_login: lastLogin,
        most_used_ip: mostUsedIp,
      },
    };
  }

  /**
   * Get error statistics and analysis
   */
  async getErrorStats(
    query: ErrorStatsQueryDto,
  ): Promise<ErrorStatsResponseDto> {
    const { severity, startDate, endDate, groupBy = 'action' } = query;

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const where: Prisma.ActivityLogWhereInput = {
      status: AuditStatus.FAILED,
    };

    if (severity) where.severity = severity;

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    // Overview stats
    const [totalErrors, totalWarnings, totalCritical, firstError, lastError] =
      await Promise.all([
        this.prisma.activityLog.count({
          where: { ...where, status: AuditStatus.FAILED },
        }),
        this.prisma.activityLog.count({
          where: { ...where, severity: AuditSeverity.WARNING },
        }),
        this.prisma.activityLog.count({
          where: { ...where, severity: AuditSeverity.CRITICAL },
        }),
        this.prisma.activityLog.findFirst({
          where,
          orderBy: { timestamp: 'asc' },
        }),
        this.prisma.activityLog.findFirst({
          where,
          orderBy: { timestamp: 'desc' },
        }),
      ]);

    // Grouped data based on groupBy parameter
    const groupedData: Record<
      string,
      { count: number; percentage: number; details: any[] }
    > = {};

    const totalCount = totalErrors;

    if (groupBy === 'action') {
      const grouped = await this.prisma.activityLog.groupBy({
        by: ['action'],
        where,
        _count: true,
      });

      for (const item of grouped) {
        const details = await this.prisma.activityLog.findMany({
          where: { ...where, action: item.action },
          select: {
            action: true,
            errorMessage: true,
            timestamp: true,
          },
          orderBy: { timestamp: 'desc' },
          take: 5,
        });

        groupedData[item.action] = {
          count: item._count,
          percentage: (item._count / totalCount) * 100,
          details: details.map((d) => ({
            key: d.action,
            count: item._count,
            last_occurrence: d.timestamp.toISOString(),
          })),
        };
      }
    } else if (groupBy === 'module') {
      const grouped = await this.prisma.activityLog.groupBy({
        by: ['module'],
        where: { ...where, module: { not: null } },
        _count: true,
      });

      for (const item of grouped) {
        const details = await this.prisma.activityLog.findMany({
          where: { ...where, module: item.module },
          select: {
            module: true,
            errorMessage: true,
            timestamp: true,
          },
          orderBy: { timestamp: 'desc' },
          take: 5,
        });

        groupedData[item.module || 'unknown'] = {
          count: item._count,
          percentage: (item._count / totalCount) * 100,
          details: details.map((d) => ({
            key: d.module || 'unknown',
            count: item._count,
            last_occurrence: d.timestamp.toISOString(),
          })),
        };
      }
    } else if (groupBy === 'user') {
      const grouped = await this.prisma.activityLog.groupBy({
        by: ['userId', 'userEmail'],
        where: { ...where, userId: { not: null } },
        _count: true,
      });

      for (const item of grouped) {
        const details = await this.prisma.activityLog.findMany({
          where: { ...where, userId: item.userId },
          select: {
            userEmail: true,
            errorMessage: true,
            timestamp: true,
          },
          orderBy: { timestamp: 'desc' },
          take: 5,
        });

        groupedData[item.userEmail || item.userId || 'unknown'] = {
          count: item._count,
          percentage: (item._count / totalCount) * 100,
          details: details.map((d) => ({
            key: d.userEmail || 'unknown',
            count: item._count,
            last_occurrence: d.timestamp.toISOString(),
          })),
        };
      }
    }

    // Top errors by error message
    const errorMessages = await this.prisma.activityLog.groupBy({
      by: ['errorMessage'],
      where: { ...where, errorMessage: { not: null } },
      _count: true,
      orderBy: { _count: { errorMessage: 'desc' } },
      take: 10,
    });

    const topErrors = await Promise.all(
      errorMessages.map(async (err) => {
        const example = await this.prisma.activityLog.findFirst({
          where: { ...where, errorMessage: err.errorMessage },
          orderBy: { timestamp: 'desc' },
        });

        return {
          id: example?.id || '',
          action: example?.action || AuditAction.READ,
          module: example?.module || undefined,
          entity_type: example?.entityType || EntityType.USER,
          error_message: err.errorMessage || '',
          severity: example?.severity || AuditSeverity.ERROR,
          timestamp: example?.timestamp.toISOString() || '',
          user: example?.userId
            ? {
                id: example.userId,
                email: example.userEmail || undefined,
                name: example.userName || undefined,
                role: example.userRole || undefined,
              }
            : undefined,
          occurrence_count: err._count,
        };
      }),
    );

    // Trends
    const [errorsLast24h, errorsLast7d, errorsLast30d] = await Promise.all([
      this.prisma.activityLog.count({
        where: { ...where, timestamp: { gte: last24h } },
      }),
      this.prisma.activityLog.count({
        where: { ...where, timestamp: { gte: last7d } },
      }),
      this.prisma.activityLog.count({
        where: { ...where, timestamp: { gte: last30d } },
      }),
    ]);

    return {
      overview: {
        total_errors: totalErrors,
        total_warnings: totalWarnings,
        total_critical: totalCritical,
        date_range: {
          first_error: firstError?.timestamp.toISOString() || '',
          last_error: lastError?.timestamp.toISOString() || '',
        },
      },
      grouped_data: groupedData,
      top_errors: topErrors,
      trends: {
        last_24h: errorsLast24h,
        last_7d: errorsLast7d,
        last_30d: errorsLast30d,
      },
    };
  }

  /**
   * Global search across audit logs
   */
  async globalSearch(
    query: GlobalSearchQueryDto,
  ): Promise<GlobalSearchResponseDto> {
    const startTime = Date.now();
    const {
      q = '',
      searchIn = ['description', 'metadata', 'userEmail'],
      action,
      module,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.ActivityLogWhereInput = {};

    // Build search conditions
    if (q) {
      const searchConditions: Prisma.ActivityLogWhereInput[] = [];

      if (searchIn.includes('description')) {
        searchConditions.push({
          description: { contains: q, mode: 'insensitive' },
        });
      }

      if (searchIn.includes('userEmail')) {
        searchConditions.push({
          userEmail: { contains: q, mode: 'insensitive' },
        });
      }

      if (searchIn.includes('metadata')) {
        // Note: Searching in JSON fields requires special handling
        // This is a simplified version
        searchConditions.push({
          description: { contains: q, mode: 'insensitive' },
        });
      }

      where.OR = searchConditions;
    }

    // Apply filters
    if (action) where.action = action;
    if (module) where.module = module;

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    // Execute search
    const [activities, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          dataChanges: true,
        },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    // Calculate facets
    const [byAction, byModule, bySeverity] = await Promise.all([
      this.prisma.activityLog.groupBy({
        by: ['action'],
        where,
        _count: true,
      }),
      this.prisma.activityLog.groupBy({
        by: ['module'],
        where: { ...where, module: { not: null } },
        _count: true,
      }),
      this.prisma.activityLog.groupBy({
        by: ['severity'],
        where,
        _count: true,
      }),
    ]);

    // Map results
    const results: SearchResultDto[] = activities.map((activity) => {
      const matchedFields: string[] = [];
      const matchedContent: { field: string; snippet: string }[] = [];

      if (
        searchIn.includes('description') &&
        activity.description.toLowerCase().includes(q.toLowerCase())
      ) {
        matchedFields.push('description');
        matchedContent.push({
          field: 'description',
          snippet: this.getSnippet(activity.description, q),
        });
      }

      if (
        searchIn.includes('userEmail') &&
        activity.userEmail?.toLowerCase().includes(q.toLowerCase())
      ) {
        matchedFields.push('userEmail');
        matchedContent.push({
          field: 'userEmail',
          snippet: activity.userEmail || '',
        });
      }

      return {
        id: activity.id,
        type: 'activity' as const,
        timestamp: activity.timestamp.toISOString(),
        action: activity.action,
        module: activity.module || undefined,
        entity_type: activity.entityType,
        entity_id: activity.entityId || undefined,
        description: activity.description,
        user: activity.userId
          ? {
              id: activity.userId,
              email: activity.userEmail || undefined,
              name: activity.userName || undefined,
              role: activity.userRole || undefined,
            }
          : undefined,
        severity: activity.severity,
        status: activity.status,
        matched_fields: matchedFields,
        matched_content: matchedContent,
        metadata: activity.metadata
          ? (activity.metadata as Record<string, any>)
          : undefined,
        prisoner_related_id: activity.prisonerRelatedId || undefined,
      };
    });

    const searchTimeMs = Date.now() - startTime;
    const totalPages = Math.ceil(total / limit);

    return {
      results,
      search_meta: {
        query: q,
        searched_in: searchIn,
        total_results: total,
        search_time_ms: searchTimeMs,
      },
      pagination: {
        page,
        limit,
        total,
        total_pages: totalPages,
        has_next: page < totalPages,
        has_prev: page > 1,
      },
      facets: {
        by_type: { activity: total },
        by_action: Object.fromEntries(
          byAction.map((item) => [item.action, item._count]),
        ),
        by_module: Object.fromEntries(
          byModule.map((item) => [item.module || 'unknown', item._count]),
        ),
        by_severity: Object.fromEntries(
          bySeverity.map((item) => [item.severity, item._count]),
        ),
      },
    };
  }

  /**
   * Helper to extract a snippet around the search term
   */
  private getSnippet(text: string, searchTerm: string, context = 50): string {
    const lowerText = text.toLowerCase();
    const lowerTerm = searchTerm.toLowerCase();
    const index = lowerText.indexOf(lowerTerm);

    if (index === -1) return text.substring(0, context * 2);

    const start = Math.max(0, index - context);
    const end = Math.min(text.length, index + searchTerm.length + context);

    let snippet = text.substring(start, end);

    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';

    return snippet;
  }
}
