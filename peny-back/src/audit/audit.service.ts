import { Injectable, Logger } from '@nestjs/common';
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
import { CreateSessionLogDto, UpdateSessionLogDto } from './dto/session-log.dto';
import { CreateDataChangeLogDto } from './dto/data-change-log.dto';

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
          metadata: dto.metadata ? (dto.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
          status: dto.status ?? AuditStatus.SUCCESS,
          errorMessage: dto.error_message,
          module: dto.module,
          severity: dto.severity ?? AuditSeverity.INFO,
          sessionLogId: dto.session_log_id,
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
    });

    return {
      activityLog
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
    });
  }

  /**
   * Get activity logs with filters
   */
  async getActivityLogs(filters: {
    userId?: string;
    action?: AuditAction;
    entityType?: EntityType;
    entityId?: string;
    module?: AuditModuleEnum;
    severity?: AuditSeverity;
    status?: AuditStatus;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    size?: number;
  }): Promise<{ items: ActivityLog[]; total: number; page: number; size: number; totalPages: number }> {
    const {
      userId,
      action,
      entityType,
      entityId,
      module,
      severity,
      status,
      startDate,
      endDate,
      page = 1,
      size = 10,
    } = filters;

    const skip = (page - 1) * size;

    const where: Prisma.ActivityLogWhereInput = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (module) where.module = module;
    if (severity) where.severity = severity;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const [items, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        skip,
        take: size,
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.activityLog.count({ where }),
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
  }): Promise<{ items: SessionLog[]; total: number; page: number; size: number; totalPages: number }> {
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
}
