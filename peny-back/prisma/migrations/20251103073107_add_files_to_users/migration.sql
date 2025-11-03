/*
  Warnings:

  - You are about to drop the column `photoUrl` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[photoFileId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'DIRECTOR';

-- AlterTable
ALTER TABLE "users" DROP COLUMN "photoUrl",
ADD COLUMN     "isFirstLogin" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "photoFileId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_photoFileId_key" ON "users"("photoFileId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_photoFileId_fkey" FOREIGN KEY ("photoFileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
