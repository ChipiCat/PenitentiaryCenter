/*
  Warnings:

  - You are about to drop the column `filePath` on the `medical_records` table. All the data in the column will be lost.
  - You are about to drop the column `filePath` on the `prisoner_belongings` table. All the data in the column will be lost.
  - You are about to drop the column `leftHandFingerprintUrl` on the `prisoner_identity` table. All the data in the column will be lost.
  - You are about to drop the column `photoUrl` on the `prisoner_identity` table. All the data in the column will be lost.
  - You are about to drop the column `rightHandFingerprintUrl` on the `prisoner_identity` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "medical_records" DROP COLUMN "filePath",
ADD COLUMN     "fileId" TEXT;

-- AlterTable
ALTER TABLE "prisoner_belongings" DROP COLUMN "filePath",
ADD COLUMN     "inventoryFileId" TEXT;

-- AlterTable
ALTER TABLE "prisoner_identity" DROP COLUMN "leftHandFingerprintUrl",
DROP COLUMN "photoUrl",
DROP COLUMN "rightHandFingerprintUrl",
ADD COLUMN     "leftFingerprintFileId" TEXT,
ADD COLUMN     "photoFileId" TEXT,
ADD COLUMN     "rightFingerprintFileId" TEXT;

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storagePath" TEXT,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storageType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "files_entityType_entityId_idx" ON "files"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "files_entityType_entityId_fieldName_idx" ON "files"("entityType", "entityId", "fieldName");

-- CreateIndex
CREATE INDEX "files_createdBy_idx" ON "files"("createdBy");

-- CreateIndex
CREATE INDEX "files_deletedAt_idx" ON "files"("deletedAt");

-- AddForeignKey
ALTER TABLE "prisoner_identity" ADD CONSTRAINT "prisoner_identity_photoFileId_fkey" FOREIGN KEY ("photoFileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prisoner_identity" ADD CONSTRAINT "prisoner_identity_rightFingerprintFileId_fkey" FOREIGN KEY ("rightFingerprintFileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prisoner_identity" ADD CONSTRAINT "prisoner_identity_leftFingerprintFileId_fkey" FOREIGN KEY ("leftFingerprintFileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prisoner_belongings" ADD CONSTRAINT "prisoner_belongings_inventoryFileId_fkey" FOREIGN KEY ("inventoryFileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
