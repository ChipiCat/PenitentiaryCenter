-- CreateEnum
CREATE TYPE "public"."PrisonerStatus" AS ENUM ('Activo', 'Trasladado', 'Liberado', 'Archivado');

-- CreateEnum
CREATE TYPE "public"."CitizenshipType" AS ENUM ('Local', 'CiudadanoNacional', 'CiudadanoExtranjero');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('Masculino', 'Femenino', 'Otro');

-- CreateEnum
CREATE TYPE "public"."MaritalStatus" AS ENUM ('Soltero', 'Casado', 'Viudo', 'Divorciado');

-- CreateEnum
CREATE TYPE "public"."IdDocumentType" AS ENUM ('CedulaDeIdentidad', 'Pasaporte', 'Otro');

-- CreateEnum
CREATE TYPE "public"."PrisonerCategory" AS ENUM ('DerechoComun', 'PrisionPreventiva', 'PrisioneroAcusado');

-- CreateTable
CREATE TABLE "public"."prisoners" (
    "id" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "admissionDate" TIMESTAMP(3) NOT NULL,
    "fiscalFileNumber" TEXT,
    "status" "public"."PrisonerStatus" NOT NULL DEFAULT 'Activo',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "prisoners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."prisoner_identity" (
    "id" TEXT NOT NULL,
    "prisonerId" TEXT NOT NULL,
    "photoUrl" TEXT,
    "rightHandFingerprintUrl" TEXT,
    "leftHandFingerprintUrl" TEXT,
    "surname" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "birthPlace" TEXT,
    "residence" TEXT,
    "citizenshipType" "public"."CitizenshipType",
    "countryOfOrigin" TEXT,
    "nationalityType" TEXT,
    "nationality" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "prisoner_identity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."prisoner_personal" (
    "id" TEXT NOT NULL,
    "prisonerId" TEXT NOT NULL,
    "gender" "public"."Gender",
    "fatherName" TEXT,
    "motherName" TEXT,
    "educationLevel" TEXT,
    "occupation" TEXT,
    "languages" TEXT,
    "maritalStatus" "public"."MaritalStatus",
    "idDocumentType" "public"."IdDocumentType",
    "idDocumentNumber" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "prisoner_personal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."prisoner_penitentiary" (
    "id" TEXT NOT NULL,
    "prisonerId" TEXT NOT NULL,
    "category" "public"."PrisonerCategory",
    "buildingNumber" TEXT,
    "cellNumber" TEXT,
    "bedNumber" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "prisoner_penitentiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."medical_records" (
    "id" TEXT NOT NULL,
    "prisonerId" TEXT NOT NULL,
    "doctorName" TEXT,
    "examinationDate" TIMESTAMP(3),
    "referenceNumber" TEXT,
    "filePath" TEXT,
    "notes" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."prisoner_belongings" (
    "id" TEXT NOT NULL,
    "prisonerId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "condition" TEXT,
    "returned" BOOLEAN NOT NULL DEFAULT false,
    "filePath" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "prisoner_belongings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."prisoner_contacts" (
    "id" TEXT NOT NULL,
    "prisonerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "prisoner_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."prisoner_children" (
    "id" TEXT NOT NULL,
    "prisonerId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "prisoner_children_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "prisoners_registrationNumber_key" ON "public"."prisoners"("registrationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "prisoner_identity_prisonerId_key" ON "public"."prisoner_identity"("prisonerId");

-- CreateIndex
CREATE UNIQUE INDEX "prisoner_personal_prisonerId_key" ON "public"."prisoner_personal"("prisonerId");

-- CreateIndex
CREATE UNIQUE INDEX "prisoner_penitentiary_prisonerId_key" ON "public"."prisoner_penitentiary"("prisonerId");

-- AddForeignKey
ALTER TABLE "public"."prisoner_identity" ADD CONSTRAINT "prisoner_identity_prisonerId_fkey" FOREIGN KEY ("prisonerId") REFERENCES "public"."prisoners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prisoner_personal" ADD CONSTRAINT "prisoner_personal_prisonerId_fkey" FOREIGN KEY ("prisonerId") REFERENCES "public"."prisoners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prisoner_penitentiary" ADD CONSTRAINT "prisoner_penitentiary_prisonerId_fkey" FOREIGN KEY ("prisonerId") REFERENCES "public"."prisoners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."medical_records" ADD CONSTRAINT "medical_records_prisonerId_fkey" FOREIGN KEY ("prisonerId") REFERENCES "public"."prisoners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prisoner_belongings" ADD CONSTRAINT "prisoner_belongings_prisonerId_fkey" FOREIGN KEY ("prisonerId") REFERENCES "public"."prisoners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prisoner_contacts" ADD CONSTRAINT "prisoner_contacts_prisonerId_fkey" FOREIGN KEY ("prisonerId") REFERENCES "public"."prisoners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."prisoner_children" ADD CONSTRAINT "prisoner_children_prisonerId_fkey" FOREIGN KEY ("prisonerId") REFERENCES "public"."prisoners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
