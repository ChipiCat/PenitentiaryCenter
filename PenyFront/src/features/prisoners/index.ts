// Imports para re-exportar
import PrisonersPageComponent from './pages/PrisonersPage';

// Named exports
export { default as PrisonersPage } from './pages/PrisonersPage';
export { default as NewPrisonerPage } from './pages/NewPrisonerPage';
export { usePrisoners } from './hooks/usePrisoners';
export { useNewPrisoner } from './hooks/useNewPrisoner';
export * from './types';

// Default export
export default PrisonersPageComponent;