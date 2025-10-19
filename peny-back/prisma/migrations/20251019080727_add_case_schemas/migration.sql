-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('EnProceso', 'Condenado', 'Apelacion', 'Cerrado');

-- CreateEnum
CREATE TYPE "MandateType" AS ENUM ('Detencion', 'Condena', 'Libertad', 'Apelacion', 'Traslado');

-- CreateEnum
CREATE TYPE "MandateStatus" AS ENUM ('Vigente', 'Ejecutado', 'Anulado');

-- CreateTable
CREATE TABLE "prisoner_cases" (
    "id" TEXT NOT NULL,
    "prisonerId" TEXT NOT NULL,
    "caseNumber" TEXT NOT NULL,
    "crime" TEXT NOT NULL,
    "status" "CaseStatus" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "courtName" TEXT,
    "judgeName" TEXT,
    "sentenceYears" INTEGER,
    "remarks" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "prisoner_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prisoner_mandates" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "type" "MandateType" NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "fileId" TEXT,
    "description" TEXT,
    "status" "MandateStatus" NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prisoner_mandates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "prisoner_cases" ADD CONSTRAINT "prisoner_cases_prisonerId_fkey" FOREIGN KEY ("prisonerId") REFERENCES "prisoners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prisoner_mandates" ADD CONSTRAINT "prisoner_mandates_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prisoner_mandates" ADD CONSTRAINT "prisoner_mandates_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "prisoner_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
