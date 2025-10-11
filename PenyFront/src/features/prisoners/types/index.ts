// Barrel export - exportar todos los types desde un solo lugar
export * from './prisoner.types';
export * from './form.types';

// Re-exportar ViewMode si se usa en otros lugares
export type ViewMode = 'table' | 'cards';