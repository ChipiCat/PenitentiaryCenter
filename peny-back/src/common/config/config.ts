export const UPLOAD_CONFIG = {
  photo: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    maxSize: 5 * 1024 * 1024, // 5MB
    folder: 'photos'
  },
  fingerprint: {
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    maxSize: 10 * 1024 * 1024, // 10MB
    folder: 'fingerprints'
  },
  medical_file: {
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxSize: 20 * 1024 * 1024, // 20MB
    folder: 'medical'
  },
  belonging_inventory: {
    allowedTypes: ['application/pdf'],
    maxSize: 10 * 1024 * 1024, // 10MB
    folder: 'inventories'
  },

  mandated_document: {
    allowedTypes: ['application/pdf'],
    maxSize: 15 * 1024 * 1024, // 15MB
    folder: 'mandated_documents'
  }
};