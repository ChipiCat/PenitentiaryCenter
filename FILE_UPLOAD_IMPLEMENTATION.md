# File Upload Implementation Summary

## Overview
Successfully implemented a clean, properly typed file upload solution for the prisoner form wizard. The implementation follows software engineering best practices with:
- Proper TypeScript typing throughout
- Separation of concerns
- Unified file handling pattern
- Creation-only workflow (edit mode removed)

## Architecture

### File Upload Flow
1. **User selects file** in component dropzone (BelongingDropzone, ProfilePhotoDropzone, FingerprintDropzone)
2. **Component calls callback** with file data
3. **Parent step component** receives file and passes to `onFileUpdate`
4. **Form handler** stores file in `formFiles` state
5. **During submission**, entities are created first to get IDs
6. **After entity creation**, files are uploaded using entity IDs

### File Types Handled

#### Single Files
- **Photo**: Profile photo (BasicInfoStep → identityService.uploadPhoto)
- **Fingerprint Left**: Left hand fingerprint (BasicInfoStep → identityService.uploadFingerprint)
- **Fingerprint Right**: Right hand fingerprint (BasicInfoStep → identityService.uploadFingerprint)
- **Medical File**: Medical record document (MedicalStep → medicalRecordsService.uploadMedicalFile)

#### Multiple Files (Record-based)
- **Belonging Files**: Inventory photos (PersonalInfoStep/BelongingsListForm → belongingsService.uploadInventory)
- **Mandate Files**: Legal mandate documents (LegalCaseStep/MandateCard → mandatesService.uploadMandateFile)

## Implementation Details

### Type System

**FormFiles Interface** (`formState.ts`)
```typescript
export interface FormFiles {
  photo?: File;
  fingerprintLeft?: File;
  fingerprintRight?: File;
  medicalFile?: File;
  belongingFiles?: Record<string, File>;  // Key: tempId or index
  mandateFiles?: Record<string, File>;    // Key: tempId or index
}
```

### Component Updates

#### 1. BasicInfoStep.tsx ✅
- Already implemented file handling for photo and fingerprints
- Uses `onFileUpdate("photo", file)` pattern
- No changes needed

#### 2. MedicalStep.tsx ✅
- Already implemented file handling for medical file
- Uses `onFileUpdate("medicalFile", file)` pattern
- No changes needed

#### 3. PersonalInfoStep.tsx ✅ (UPDATED)
- Added `onFileUpdate` prop to interface
- Connected `BelongingsListForm` with file handling callback:
```typescript
<BelongingsListForm
  items={belongings}
  onAdd={handleAddBelonging}
  onRemove={handleRemoveBelonging}
  onChange={handleBelongingChange}
  onFileChange={(identifier, file) => {
    onFileUpdate?.('belongingFiles', file, identifier);
  }}
  errors={errors}
  addLabel="Agregar pertenencia"
/>
```

#### 4. BelongingsListForm.tsx ✅ (UPDATED)
- Added `onFileChange?: (identifier: string | number, file: File) => void` prop
- Implemented file selection handler in BelongingDropzone:
```typescript
<BelongingDropzone
  onFile={(file) => {
    if (onFileChange) {
      const identifier = belonging.tempId || index;
      onFileChange(identifier, file);
    }
  }}
/>
```

#### 5. LegalCaseStep.tsx ✅ (UPDATED)
- Added `onFileUpdate` prop to interface
- Updated `handleMandateChange` to intercept file uploads:
```typescript
const handleMandateChange = useCallback((
  caseIndex: number,
  mandateIndex: number,
  field: keyof MandateFormData,
  value: unknown
) => {
  // If it's a file, route it to onFileUpdate instead of storing in form state
  if (field === 'file' && value instanceof File) {
    const mandate = cases[caseIndex]?.mandates[mandateIndex];
    const identifier = mandate?.tempId || `${caseIndex}_${mandateIndex}`;
    onFileUpdate?.('mandateFiles', value, identifier);
    return;
  }
  // ... rest of handler
}, [cases, onUpdate, onFileUpdate]);
```

#### 6. MandateCard.tsx ✅
- Already implemented file handling with BelongingDropzone
- Calls `onChange(caseIndex, index, 'file', file)`
- No changes needed (handled by LegalCaseStep)

### Form Handler

**usePrisonerFormHandler.ts** - Completely rewritten as creation-only (530 lines, clean)

#### File State Management
```typescript
const [formFiles, setFormFiles] = useState<FormFiles>({
  photo: undefined,
  fingerprintLeft: undefined,
  fingerprintRight: undefined,
  medicalFile: undefined,
  belongingFiles: {},
  mandateFiles: {}
});

const handleFileUpdate = useCallback((
  fileType: string,
  file: File | undefined,
  index?: string | number
) => {
  if (fileType === 'belongingFiles' && index !== undefined) {
    setFormFiles(prev => ({
      ...prev,
      belongingFiles: {
        ...prev.belongingFiles,
        [index]: file!
      }
    }));
  } else if (fileType === 'mandateFiles' && index !== undefined) {
    setFormFiles(prev => ({
      ...prev,
      mandateFiles: {
        ...prev.mandateFiles,
        [index]: file!
      }
    }));
  } else {
    // Single files
    setFormFiles(prev => ({ ...prev, [fileType]: file }));
  }
}, []);
```

#### Upload Logic Examples

**Identity Files** (Step 3)
```typescript
if (formFiles.photo) {
  await identityService.uploadPhoto(prisonerId, formFiles.photo);
}
if (formFiles.fingerprintRight) {
  await identityService.uploadFingerprint(prisonerId, formFiles.fingerprintRight, 'right');
}
if (formFiles.fingerprintLeft) {
  await identityService.uploadFingerprint(prisonerId, formFiles.fingerprintLeft, 'left');
}
```

**Belonging Files** (Step 5)
```typescript
for (let i = 0; i < formData.belongings.length; i++) {
  const belonging = formData.belongings[i];
  const belongingData = { /* ... */ };
  
  const createdBelonging = await belongingsService.createBelonging(prisonerId, belongingData);
  
  // Upload file if exists
  const belongingFile = formFiles.belongingFiles?.[belonging.tempId || i];
  if (belongingFile && createdBelonging.id) {
    await belongingsService.uploadInventory(prisonerId, createdBelonging.id, belongingFile);
  }
}
```

**Mandate Files** (Step 9)
```typescript
for (const mandate of caseData.mandates) {
  const mandatePayload = { /* ... */ };
  
  const createdMandate = await mandatesService.createMandate(createdCase.id, mandatePayload);
  
  // Upload file if exists
  const mandateFile = formFiles.mandateFiles?.[mandate.tempId || ''];
  if (mandateFile && createdMandate.id) {
    await mandatesService.uploadMandateFile(createdMandate.id, mandateFile);
  }
}
```

**Medical File** (Step 6)
```typescript
if (formData.medical) {
  const createdMedical = await medicalRecordsService.createMedicalRecord(prisonerId, medicalData);
  
  // Upload medical file if exists
  if (formFiles.medicalFile && createdMedical.id) {
    await medicalRecordsService.uploadMedicalFile(prisonerId, createdMedical.id, formFiles.medicalFile);
  }
}
```

## Key Patterns

### TempId Pattern
Entities that don't exist in the database yet use temporary IDs for tracking:
```typescript
tempId: `${type}_${Date.now()}_${Math.random()}`
```

This allows:
- Identifying entities before database creation
- Tracking files associated with specific entities
- React key generation for list rendering

### Service-Based Uploads
Each entity type has its own service with upload methods:
- `identityService.uploadPhoto(prisonerId, file)`
- `identityService.uploadFingerprint(prisonerId, file, hand)`
- `medicalRecordsService.uploadMedicalFile(prisonerId, recordId, file)`
- `belongingsService.uploadInventory(prisonerId, belongingId, file)`
- `mandatesService.uploadMandateFile(mandateId, file)`

### Error Handling
- File existence checks before upload (`if (file && entityId)`)
- TypeScript strict null checks
- Service methods handle HTTP errors
- Form validation before submission

## Edit Mode Removal

### Changes Made
1. **PrisonerFormWizard.tsx**
   - Removed `mode` prop
   - Removed `prisonerId` prop
   - Removed `isEdit` state
   - Simplified to creation-only

2. **usePrisonerFormHandler.ts**
   - Completely rewritten
   - Removed 400+ lines of edit logic
   - Removed `loadPrisonerData` function
   - Removed edit state management
   - Clean 530-line creation-only implementation

3. **BasicInfoStep.tsx**
   - Removed `mode` parameter from props
   - Removed disabled logic based on edit mode

## Verification Status

### ✅ All TypeScript Errors Resolved
- usePrisonerFormHandler.ts: No errors
- PrisonerFormWizard.tsx: No errors
- LegalCaseStep.tsx: No errors
- PersonalInfoStep.tsx: No errors
- BelongingsListForm.tsx: No errors

### ✅ File Upload Chain Complete
1. BasicInfoStep → Photo, Fingerprints ✅
2. MedicalStep → Medical File ✅
3. PersonalInfoStep → Belonging Files ✅
4. LegalCaseStep → Mandate Files ✅

### ✅ Proper Type Safety
- FormFiles interface properly typed
- File callbacks properly typed
- Service methods properly typed
- All components use proper TypeScript

## Next Steps for Testing

1. **Manual Testing**
   - Test each file upload in the wizard
   - Verify files are stored correctly
   - Check error handling
   - Verify progress notifications

2. **Integration Testing**
   - Test complete wizard flow
   - Verify all files upload after entity creation
   - Check database persistence
   - Verify file storage service integration

3. **Edge Cases**
   - Test without files (optional files)
   - Test with large files
   - Test with invalid file types
   - Test network failures during upload

4. **Clean Up**
   - Remove old `usePrisonerFormHandler.old.ts` if exists
   - Update documentation
   - Add JSDoc comments if needed

## Benefits Achieved

✅ **Clean Architecture**: Separation of concerns, single responsibility
✅ **Type Safety**: Complete TypeScript coverage
✅ **Maintainability**: Easy to understand and modify
✅ **Consistency**: Unified pattern for all file uploads
✅ **Reliability**: Proper error handling and validation
✅ **Scalability**: Easy to add new file types
