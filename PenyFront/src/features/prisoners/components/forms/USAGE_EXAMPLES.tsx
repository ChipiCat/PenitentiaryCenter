/**
 * EJEMPLO DE USO: Sistema de Actualización Parcial de Prisioneros
 * 
 * Este archivo muestra cómo usar el nuevo sistema de actualización parcial
 */

import React from 'react';
import { PrisonerFormWizard } from './PrisonerFormWizard';
import type { CreatePrisonerData } from '../../../../shared/types';

// ========================================
// EJEMPLO 1: Crear un nuevo prisionero
// ========================================
export const CreatePrisonerExample = () => {
  const handleSuccess = (result: { prisoner: any; id: string }) => {
    console.log('✅ Prisionero creado:', result);
    // Navegar a la página del prisionero, actualizar lista, etc.
  };

  const handleCancel = () => {
    console.log('❌ Creación cancelada');
    // Volver a la lista, mostrar confirmación, etc.
  };

  return (
    <PrisonerFormWizard
      mode="create"
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
};

// ========================================
// EJEMPLO 2: Editar un prisionero existente
// ========================================
export const EditPrisonerExample = () => {
  const prisonerId = 'abc-123-def-456'; // ID del prisionero a editar
  
  // Datos iniciales cargados del backend
  const initialData: Partial<CreatePrisonerData> = {
    registration_number: '2025-001',
    admission_date: '2025-01-15',
    fiscal_file_number: 'FIS-2025-001',
    status: 'Activo',
    identity: {
      surname: 'García',
      first_name: 'Juan',
      birth_date: '1990-01-01',
      birth_place: 'Ciudad de México',
      residence: 'Colonia Centro',
      citizenship_type: 'Local',
      country_of_origin: 'México',
      nationality_type: 'Por nacimiento',
      nationality: 'Mexicana'
    },
    personal: {
      gender: 'Masculino',
      father_name: 'Pedro García',
      mother_name: 'María López',
      education_level: 'Secundaria',
      occupation: 'Carpintero',
      languages: 'Español',
      marital_status: 'Soltero',
      id_document_type: 'CedulaDeIdentidad',
      id_document_number: '12345678'
    },
    penitentiary: {
      building_number: 'A',
      cell_number: '101',
      bed_number: '1',
      category: 'DerechoComun'
    },
    cases: [
      {
        case_number: 'CASO-2025-001',
        crime: 'Robo con violencia',
        status: 'EnProceso' as const,
        start_date: '2025-01-15',
        end_date: '2030-01-15',
        court_name: 'Juzgado Penal del Distrito',
        judge_name: 'Juez María González',
        sentence_years: 5,
        remarks: 'Sentencia dictada en primera instancia',
        mandates: [
          {
            type: 'Detencion' as const,
            issue_date: '2025-01-20',
            description: 'Mandato de detención preventiva por 90 días',
            status: 'Vigente' as const
          }
        ]
      }
    ]
  };

  const handleSuccess = (result: { prisoner: any; id: string }) => {
    console.log('✅ Prisionero actualizado:', result);
    
    // El sistema solo actualizó las secciones que cambiaron
    // Por ejemplo, si solo se modificó el teléfono en "personal",
    // solo se llamó a personalService.updatePersonal()
  };

  const handleCancel = () => {
    console.log('❌ Edición cancelada');
  };

  return (
    <PrisonerFormWizard
      mode="edit"
      prisonerId={prisonerId}
      initialData={initialData}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
};

// ========================================
// EJEMPLO 3: Editar con datos precargados
// ========================================
export const EditWithPreloadedDataExample = () => {
  const [prisonerData, setPrisonerData] = React.useState<Partial<CreatePrisonerData> | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simular carga de datos del backend
    const loadPrisonerData = async () => {
      try {
        // const data = await prisonersService.getPrisoner(prisonerId);
        // setPrisonerData(data);
        
        // Simulación:
        setPrisonerData({
          registration_number: '2025-002',
          admission_date: '2025-02-01',
          fiscal_file_number: 'FIS-2025-002',
          identity: {
            surname: 'Pérez',
            first_name: 'Ana',
            birth_date: '1992-05-15',
            birth_place: 'Guadalajara',
            residence: 'Centro',
            nationality: 'Mexicana'
          }
        });
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPrisonerData();
  }, []);

  if (loading) {
    return <div>Cargando datos del prisionero...</div>;
  }

  if (!prisonerData) {
    return <div>Error: No se pudieron cargar los datos</div>;
  }

  return (
    <PrisonerFormWizard
      mode="edit"
      prisonerId="prisoner-id-123"
      initialData={prisonerData}
      onSuccess={(result) => {
        console.log('Actualización exitosa:', result);
      }}
      onCancel={() => {
        console.log('Edición cancelada');
      }}
    />
  );
};

// ========================================
// EJEMPLO 4: Flujo completo con navegación
// ========================================
export const CompleteFlowExample = () => {
  const [mode, setMode] = React.useState<'list' | 'create' | 'edit'>('list');
  const [selectedPrisonerId, setSelectedPrisonerId] = React.useState<string | undefined>();
  const [selectedPrisonerData, setSelectedPrisonerData] = React.useState<Partial<CreatePrisonerData>>();

  const handleCreateNew = () => {
    setMode('create');
  };

  const handleEdit = (prisonerId: string, prisonerData: Partial<CreatePrisonerData>) => {
    setSelectedPrisonerId(prisonerId);
    setSelectedPrisonerData(prisonerData);
    setMode('edit');
  };

  const handleSuccess = (result: { prisoner: any; id: string }) => {
    console.log('Operación exitosa:', result);
    setMode('list');
    // Aquí podrías actualizar la lista de prisioneros
  };

  const handleCancel = () => {
    setMode('list');
    setSelectedPrisonerId(undefined);
    setSelectedPrisonerData(undefined);
  };

  if (mode === 'create') {
    return (
      <PrisonerFormWizard
        mode="create"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );
  }

  if (mode === 'edit' && selectedPrisonerId && selectedPrisonerData) {
    return (
      <PrisonerFormWizard
        mode="edit"
        prisonerId={selectedPrisonerId}
        initialData={selectedPrisonerData}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    );
  }

  // Vista de lista - Aquí se usaría handleEdit al hacer clic en editar
  return (
    <div>
      <h1>Lista de Prisioneros</h1>
      <button onClick={handleCreateNew}>Crear Nuevo</button>
      <button onClick={() => handleEdit('example-id', { registration_number: '2025-001' })}>
        Ejemplo: Editar Prisionero
      </button>
      {/* Lista de prisioneros con botón de editar */}
    </div>
  );
};

// ========================================
// ESCENARIOS DE USO
// ========================================

/**
 * ESCENARIO 1: Usuario edita solo la información personal
 * 
 * Flujo:
 * 1. Se carga el formulario con datos existentes
 * 2. Usuario navega a la sección "Información Personal"
 * 3. Usuario modifica el campo "occupation" de "Carpintero" a "Albañil"
 * 4. Usuario hace clic en "Actualizar Prisionero"
 * 
 * Resultado:
 * - El sistema detecta que solo cambió la sección "personal"
 * - Solo se llama a personalService.updatePersonal()
 * - Se envía solo: { occupation: "Albañil" }
 * - Las demás secciones NO se tocan
 * 
 * Notificaciones mostradas:
 * - "Progreso 1/1: Actualizando información personal..."
 * - "Actualización completada: Se actualizaron 1 sección(es) correctamente"
 */

/**
 * ESCENARIO 2: Usuario edita múltiples secciones
 * 
 * Flujo:
 * 1. Usuario modifica identidad (cambio de domicilio)
 * 2. Usuario modifica ubicación penitenciaria (cambio de celda)
 * 3. Usuario sube una nueva foto
 * 4. Usuario hace clic en "Actualizar Prisionero"
 * 
 * Resultado:
 * - El sistema detecta cambios en: identity, penitentiary, files
 * - Se llaman 3 servicios en orden:
 *   1. identityService.updateIdentity()
 *   2. identityService.uploadPhoto()
 *   3. penitentiaryService.updatePenitentiary()
 * 
 * Notificaciones mostradas:
 * - "Progreso 1/3: Actualizando identidad..."
 * - "Progreso 2/3: Subiendo archivos..."
 * - "Progreso 3/3: Actualizando ubicación penitenciaria..."
 * - "Actualización completada: Se actualizaron 3 sección(es) correctamente"
 */

/**
 * ESCENARIO 3: Usuario no hace cambios
 * 
 * Flujo:
 * 1. Usuario abre el formulario en modo edición
 * 2. Usuario navega por los pasos sin modificar nada
 * 3. Usuario hace clic en "Actualizar Prisionero"
 * 
 * Resultado:
 * - El sistema detecta que NO hay cambios
 * - NO se llama a ningún servicio de actualización
 * - Se muestra: "Sin cambios: No se detectaron cambios para guardar"
 * - Se ejecuta el callback onSuccess con los datos existentes
 */

/**
 * ESCENARIO 4: Error en una sección
 * 
 * Flujo:
 * 1. Usuario modifica identity y personal
 * 2. La actualización de identity falla (error de red)
 * 3. La actualización de personal tiene éxito
 * 
 * Resultado:
 * - El sistema intenta actualizar ambas secciones
 * - identity falla pero NO detiene el proceso
 * - personal se actualiza correctamente
 * - Se muestra: "Actualización parcial: 1 sección(es) fallaron: Identidad"
 * - El usuario puede intentar guardar nuevamente
 */

export default {
  CreatePrisonerExample,
  EditPrisonerExample,
  EditWithPreloadedDataExample,
  CompleteFlowExample
};
