-- AlterTable
ALTER TABLE "activity_logs" ADD COLUMN     "prisonerRelatedId" TEXT;

-- AlterTable
ALTER TABLE "data_change_logs" ADD COLUMN     "prisonerRelatedId" TEXT;

-- CreateIndex
CREATE INDEX "activity_logs_prisonerRelatedId_timestamp_idx" ON "activity_logs"("prisonerRelatedId", "timestamp");

-- CreateIndex
CREATE INDEX "data_change_logs_prisonerRelatedId_changedAt_idx" ON "data_change_logs"("prisonerRelatedId", "changedAt");
