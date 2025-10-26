-- CreateIndex
CREATE INDEX "prisoner_identity_surname_firstName_idx" ON "prisoner_identity"("surname", "firstName");

-- CreateIndex
CREATE INDEX "prisoner_identity_citizenshipType_idx" ON "prisoner_identity"("citizenshipType");

-- CreateIndex
CREATE INDEX "prisoner_identity_countryOfOrigin_idx" ON "prisoner_identity"("countryOfOrigin");

-- CreateIndex
CREATE INDEX "prisoner_identity_nationality_idx" ON "prisoner_identity"("nationality");

-- CreateIndex
CREATE INDEX "prisoner_penitentiary_category_idx" ON "prisoner_penitentiary"("category");

-- CreateIndex
CREATE INDEX "prisoner_penitentiary_buildingNumber_cellNumber_idx" ON "prisoner_penitentiary"("buildingNumber", "cellNumber");

-- CreateIndex
CREATE INDEX "prisoner_personal_gender_idx" ON "prisoner_personal"("gender");

-- CreateIndex
CREATE INDEX "prisoner_personal_maritalStatus_idx" ON "prisoner_personal"("maritalStatus");

-- CreateIndex
CREATE INDEX "prisoner_personal_idDocumentNumber_idx" ON "prisoner_personal"("idDocumentNumber");

-- CreateIndex
CREATE INDEX "prisoners_status_isDeleted_idx" ON "prisoners"("status", "isDeleted");

-- CreateIndex
CREATE INDEX "prisoners_admissionDate_idx" ON "prisoners"("admissionDate");

-- CreateIndex
CREATE INDEX "prisoners_registrationNumber_isDeleted_idx" ON "prisoners"("registrationNumber", "isDeleted");

-- CreateIndex
CREATE INDEX "prisoners_fiscalFileNumber_idx" ON "prisoners"("fiscalFileNumber");

-- CreateIndex
CREATE INDEX "prisoners_createdAt_idx" ON "prisoners"("createdAt");
