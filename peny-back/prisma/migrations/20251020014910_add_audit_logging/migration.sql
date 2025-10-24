-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('LOGIN', 'LOGOUT', 'LOGIN_FAILED', 'PASSWORD_CHANGED', 'PASSWORD_RESET_REQUESTED', 'TOKEN_REFRESHED', 'CREATE', 'READ', 'UPDATE', 'DELETE', 'FILE_UPLOAD', 'FILE_DOWNLOAD', 'FILE_DELETE', 'FILE_VIEW', 'PRISONER_REGISTERED', 'PRISONER_TRANSFERRED', 'PRISONER_RELEASED', 'PRISONER_STATUS_CHANGED', 'IDENTITY_CREATED', 'IDENTITY_UPDATED', 'IDENTITY_PHOTO_UPLOADED', 'FINGERPRINT_UPLOADED', 'PERSONAL_INFO_CREATED', 'PERSONAL_INFO_UPDATED', 'PENITENTIARY_INFO_CREATED', 'PENITENTIARY_INFO_UPDATED', 'CELL_CHANGED', 'MEDICAL_RECORD_CREATED', 'MEDICAL_RECORD_UPDATED', 'MEDICAL_RECORD_DELETED', 'MEDICAL_FILE_UPLOADED', 'BELONGING_REGISTERED', 'BELONGING_UPDATED', 'BELONGING_RETURNED', 'BELONGING_INVENTORY_UPLOADED', 'CONTACT_ADDED', 'CONTACT_UPDATED', 'CONTACT_DELETED', 'CHILD_REGISTERED', 'CHILD_UPDATED', 'CHILD_DELETED', 'CASE_CREATED', 'CASE_UPDATED', 'CASE_CLOSED', 'MANDATE_ISSUED', 'MANDATE_EXECUTED', 'MANDATE_ANNULLED', 'REPORT_GENERATED', 'REPORT_DOWNLOADED', 'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'USER_ROLE_CHANGED', 'PERMISSIONS_CHANGED');

-- CreateEnum
CREATE TYPE "AuditStatus" AS ENUM ('SUCCESS', 'FAILED', 'PENDING', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AuditSeverity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AuditModule" AS ENUM ('AUTH', 'PRISONERS', 'IDENTITY', 'PERSONAL', 'PENITENTIARY', 'MEDICAL', 'BELONGINGS', 'CONTACTS', 'CHILDREN', 'CASES', 'MANDATES', 'FILES', 'REPORTS', 'USERS', 'SYSTEM');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('PRISONER', 'PRISONER_IDENTITY', 'PRISONER_PERSONAL', 'PRISONER_PENITENTIARY', 'MEDICAL_RECORD', 'PRISONER_BELONGING', 'PRISONER_CONTACT', 'PRISONER_CHILD', 'PRISONER_CASE', 'PRISONER_MANDATE', 'FILE', 'SESSION', 'USER', 'ROLE', 'PERMISSION');

-- CreateEnum
CREATE TYPE "LogoutReason" AS ENUM ('USER_LOGOUT', 'TOKEN_EXPIRED', 'SESSION_TIMEOUT', 'FORCE_LOGOUT_BY_ADMIN', 'SUSPICIOUS_ACTIVITY', 'PASSWORD_CHANGED', 'ACCOUNT_DISABLED', 'DEVICE_LIMIT_REACHED');

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userEmail" TEXT,
    "userName" TEXT,
    "userRole" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "entityId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "status" "AuditStatus" NOT NULL DEFAULT 'SUCCESS',
    "errorMessage" TEXT,
    "module" "AuditModule",
    "severity" "AuditSeverity" NOT NULL DEFAULT 'INFO',
    "sessionLogId" TEXT,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "loginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "logoutAt" TIMESTAMP(3),
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "deviceInfo" TEXT,
    "country" TEXT,
    "city" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "logoutReason" "LogoutReason",

    CONSTRAINT "session_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_change_logs" (
    "id" TEXT NOT NULL,
    "activityLogId" TEXT,
    "entityType" "EntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedBy" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,

    CONSTRAINT "data_change_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "activity_logs_userId_timestamp_idx" ON "activity_logs"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "activity_logs_entityType_entityId_idx" ON "activity_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "activity_logs_action_timestamp_idx" ON "activity_logs"("action", "timestamp");

-- CreateIndex
CREATE INDEX "activity_logs_module_timestamp_idx" ON "activity_logs"("module", "timestamp");

-- CreateIndex
CREATE INDEX "activity_logs_severity_timestamp_idx" ON "activity_logs"("severity", "timestamp");

-- CreateIndex
CREATE INDEX "activity_logs_status_timestamp_idx" ON "activity_logs"("status", "timestamp");

-- CreateIndex
CREATE INDEX "session_logs_userId_loginAt_idx" ON "session_logs"("userId", "loginAt");

-- CreateIndex
CREATE INDEX "session_logs_isActive_idx" ON "session_logs"("isActive");

-- CreateIndex
CREATE INDEX "session_logs_logoutReason_idx" ON "session_logs"("logoutReason");

-- CreateIndex
CREATE INDEX "data_change_logs_activityLogId_idx" ON "data_change_logs"("activityLogId");

-- CreateIndex
CREATE INDEX "data_change_logs_entityType_entityId_fieldName_idx" ON "data_change_logs"("entityType", "entityId", "fieldName");

-- CreateIndex
CREATE INDEX "data_change_logs_changedBy_changedAt_idx" ON "data_change_logs"("changedBy", "changedAt");

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_sessionLogId_fkey" FOREIGN KEY ("sessionLogId") REFERENCES "session_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_change_logs" ADD CONSTRAINT "data_change_logs_activityLogId_fkey" FOREIGN KEY ("activityLogId") REFERENCES "activity_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
