import { notifications } from '@mantine/notifications';
import { CheckCircle, AlertCircle } from 'lucide-react';

export interface PrisonerBase {
  id: string;
  registration_number: string;
  admission_date: string;
  fiscal_file_number?: string;
  status: "Activo" | "Trasladado" | "Liberado" | "Archivado";
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface Identity {
  id: string;
  prisoner_id: string;
  photo_url?: string;
  right_hand_fingerprint_url?: string;
  left_hand_fingerprint_url?: string;
  surname: string;
  first_name: string;
  birth_date?: string;
  birth_place?: string;
  residence?: string;
  citizenship_type?: "Local" | "Ciudadano Nacional" | "Ciudadano Extranjero";
  country_of_origin?: string;
  nationality_type?: string;
  nationality?: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface Personal {
  id: string;
  prisoner_id: string;
  gender?: "Masculino" | "Femenino" | "Otro";
  father_name?: string;
  mother_name?: string;
  education_level?: string;
  occupation?: string;
  languages?: string;
  marital_status?: "Soltero" | "Casado" | "Viudo" | "Divorciado";
  id_document_type?: "Cédula de identidad" | "Pasaporte" | "Otro";
  id_document_number?: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface Penitentiary {
  id: string;
  prisoner_id: string;
  category?: "Derecho Común" | "Prisión Preventiva" | "Prisionero Acusado";
  building_number?: string;
  cell_number?: string;
  bed_number?: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  prisoner_id: string;
  name: string;
  relationship: string;
  phone: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: string;
  prisoner_id: string;
  doctor_name?: string;
  examination_date?: string;
  reference_number?: string;
  file_path?: string;
  notes?: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface Belonging {
  id: string;
  prisoner_id: string;
  description: string;
  quantity?: number;
  condition?: string;
  returned?: boolean;
  file_path?: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface Child {
  id: string;
  prisoner_id: string;
  full_name: string;
  birth_date?: string;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface CompletePrisonerProfile {
  prisoner: PrisonerBase;
  identity?: Identity;
  personal?: Personal;
  penitentiary?: Penitentiary;
  contacts: Contact[];
  medical_records: MedicalRecord[];
  belongings: Belonging[];
  children: Child[];
}

export interface CreatePrisonerDTO {
  registration_number: string;
  admission_date: string;
  fiscal_file_number?: string;
  status?: "Activo" | "Trasladado" | "Liberado" | "Archivado";
}

export interface CreateIdentityDTO {
  photo_url?: string;
  right_hand_fingerprint_url?: string;
  left_hand_fingerprint_url?: string;
  surname: string;
  first_name: string;
  birth_date?: string;
  birth_place?: string;
  residence?: string;
  citizenship_type?: "Local" | "Ciudadano Nacional" | "Ciudadano Extranjero";
  country_of_origin?: string;
  nationality_type?: string;
  nationality?: string;
}

export interface CreatePersonalDTO {
  gender?: "Masculino" | "Femenino" | "Otro";
  father_name?: string;
  mother_name?: string;
  education_level?: string;
  occupation?: string;
  languages?: string;
  marital_status?: "Soltero" | "Casado" | "Viudo" | "Divorciado";
  id_document_type?: "Cédula de identidad" | "Pasaporte" | "Otro";
  id_document_number?: string;
}

export interface CreatePenitentiaryDTO {
  category?: "Derecho Común" | "Prisión Preventiva" | "Prisionero Acusado";
  building_number?: string;
  cell_number?: string;
  bed_number?: string;
}

export interface CreateContactDTO {
  name: string;
  relationship: string;
  phone: string;
}

let mockPrisoners: PrisonerBase[] = [
  {
    id: "pris-001",
    registration_number: "REG-2024-001",
    admission_date: "2024-01-15",
    fiscal_file_number: "EXP-2024-001",
    status: "Activo",
    created_by: "admin",
    updated_by: "admin",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "pris-002",
    registration_number: "REG-2024-002",
    admission_date: "2024-02-10",
    fiscal_file_number: "EXP-2024-002",
    status: "Activo",
    created_by: "admin",
    updated_by: "admin",
    created_at: "2024-02-10T10:00:00Z",
    updated_at: "2024-02-10T10:00:00Z"
  },
  {
    id: "pris-003",
    registration_number: "REG-2024-003",
    admission_date: "2024-03-05",
    fiscal_file_number: "EXP-2024-003",
    status: "Trasladado",
    created_by: "admin",
    updated_by: "admin",
    created_at: "2024-03-05T10:00:00Z",
    updated_at: "2024-03-05T10:00:00Z"
  },
  {
    id: "pris-004",
    registration_number: "REG-2024-004",
    admission_date: "2024-04-12",
    fiscal_file_number: "EXP-2024-004",
    status: "Liberado",
    created_by: "admin",
    updated_by: "admin",
    created_at: "2024-04-12T10:00:00Z",
    updated_at: "2024-04-12T10:00:00Z"
  },
  {
    id: "pris-005",
    registration_number: "REG-2024-005",
    admission_date: "2024-05-20",
    fiscal_file_number: "EXP-2024-005",
    status: "Activo",
    created_by: "admin",
    updated_by: "admin",
    created_at: "2024-05-20T10:00:00Z",
    updated_at: "2024-05-20T10:00:00Z"
  }
];

let mockIdentities: Identity[] = [
  {
    id: "id-001",
    prisoner_id: "pris-001",
    surname: "García López",
    first_name: "Juan Carlos",
    birth_date: "1985-03-20",
    birth_place: "La Paz, Bolivia",
    residence: "Zona Sur, La Paz",
    citizenship_type: "Ciudadano Nacional",
    nationality: "Boliviana",
    created_by: "admin",
    updated_by: "admin",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "id-002",
    prisoner_id: "pris-002",
    surname: "Mamani Quispe",
    first_name: "María Elena",
    birth_date: "1990-07-15",
    birth_place: "Cochabamba, Bolivia",
    residence: "Villa Tunari, Cochabamba",
    citizenship_type: "Ciudadano Nacional",
    nationality: "Boliviana",
    created_by: "admin",
    updated_by: "admin",
    created_at: "2024-02-10T10:00:00Z",
    updated_at: "2024-02-10T10:00:00Z"
  },
  {
    id: "id-003",
    prisoner_id: "pris-003",
    surname: "Fernández Silva",
    first_name: "Roberto Miguel",
    birth_date: "1982-11-08",
    birth_place: "Santa Cruz, Bolivia",
    residence: "Plan 3000, Santa Cruz",
    citizenship_type: "Ciudadano Nacional",
    nationality: "Boliviana",
    created_by: "admin",
    updated_by: "admin",
    created_at: "2024-03-05T10:00:00Z",
    updated_at: "2024-03-05T10:00:00Z"
  },
  {
    id: "id-004",
    prisoner_id: "pris-004",
    surname: "Choque Condori",
    first_name: "Ana Isabel",
    birth_date: "1995-01-25",
    birth_place: "Oruro, Bolivia",
    residence: "Centro, Oruro",
    citizenship_type: "Ciudadano Nacional",
    nationality: "Boliviana",
    created_by: "admin",
    updated_by: "admin",
    created_at: "2024-04-12T10:00:00Z",
    updated_at: "2024-04-12T10:00:00Z"
  },
  {
    id: "id-005",
    prisoner_id: "pris-005",
    surname: "Vargas Morales",
    first_name: "Luis Fernando",
    birth_date: "1988-09-14",
    birth_place: "Potosí, Bolivia",
    residence: "Villa Imperial, Potosí",
    citizenship_type: "Ciudadano Nacional",
    nationality: "Boliviana",
    created_by: "admin",
    updated_by: "admin",
    created_at: "2024-05-20T10:00:00Z",
    updated_at: "2024-05-20T10:00:00Z"
  }
];

let mockPersonals: Personal[] = [
  {
    id: "pers-001",
    prisoner_id: "pris-001",
    gender: "Masculino",
    father_name: "Carlos García",
    mother_name: "Rosa López",
    education_level: "Secundaria Completa",
    occupation: "Comerciante",
    marital_status: "Casado",
    id_document_type: "Cédula de identidad",
    id_document_number: "12345678",
    created_by: "admin",
    updated_by: "admin",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "pers-002",
    prisoner_id: "pris-002",
    gender: "Femenino",
    father_name: "José Mamani",
    mother_name: "Carmen Quispe",
    education_level: "Técnico Superior",
    occupation: "Enfermera",
    marital_status: "Soltero",
    id_document_type: "Cédula de identidad",
    id_document_number: "87654321",
    created_by: "admin",
    updated_by: "admin",
    created_at: "2024-02-10T10:00:00Z",
    updated_at: "2024-02-10T10:00:00Z"
  }
];

let mockPenitentiaries: Penitentiary[] = [
  {
    id: "pen-001",
    prisoner_id: "pris-001",
    category: "Derecho Común",
    building_number: "A",
    cell_number: "15",
    bed_number: "2",
    created_by: "admin",
    updated_by: "admin",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "pen-002",
    prisoner_id: "pris-002",
    category: "Prisión Preventiva",
    building_number: "B",
    cell_number: "08",
    bed_number: "1",
    created_by: "admin",
    updated_by: "admin",
    created_at: "2024-02-10T10:00:00Z",
    updated_at: "2024-02-10T10:00:00Z"
  }
];

let mockContacts: Contact[] = [
  {
    id: "cont-001",
    prisoner_id: "pris-001",
    name: "María García",
    relationship: "Esposa",
    phone: "70123456",
    created_by: "admin",
    updated_by: "admin",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "cont-002",
    prisoner_id: "pris-001",
    name: "Pedro García",
    relationship: "Hermano",
    phone: "75987654",
    created_by: "admin",
    updated_by: "admin",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "cont-003",
    prisoner_id: "pris-002",
    name: "Sandra Mamani",
    relationship: "Hermana",
    phone: "68741852",
    created_by: "admin",
    updated_by: "admin",
    created_at: "2024-02-10T10:00:00Z",
    updated_at: "2024-02-10T10:00:00Z"
  }
];

let mockMedicalRecords: MedicalRecord[] = [];
let mockBelongings: Belonging[] = [];
let mockChildren: Child[] = [];

const generateId = (): string => Math.random().toString(36).substr(2, 9);
const getCurrentUser = (): string => "current-user-id";
const getCurrentTimestamp = (): string => new Date().toISOString();

const delay = (ms: number = 500): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const prisonersApi = {
  async createCompletePrisoner(data: {
    prisoner: CreatePrisonerDTO;
    identity?: CreateIdentityDTO;
    personal?: CreatePersonalDTO;
    penitentiary?: CreatePenitentiaryDTO;
    contacts?: CreateContactDTO[];
  }): Promise<{ prisoner: PrisonerBase; id: string }> {
    await delay(1500);

    const now = getCurrentTimestamp();
    const user = getCurrentUser();
    const prisonerId = generateId();

    const prisoner: PrisonerBase = {
      id: prisonerId,
      registration_number: data.prisoner.registration_number,
      admission_date: data.prisoner.admission_date,
      fiscal_file_number: data.prisoner.fiscal_file_number,
      status: data.prisoner.status || "Activo",
      created_by: user,
      updated_by: user,
      created_at: now,
      updated_at: now,
    };
    mockPrisoners.push(prisoner);

    if (data.identity) {
      const identity: Identity = {
        id: generateId(),
        prisoner_id: prisonerId,
        ...data.identity,
        created_by: user,
        updated_by: user,
        created_at: now,
        updated_at: now,
      };
      mockIdentities.push(identity);
    }

    if (data.personal) {
      const personal: Personal = {
        id: generateId(),
        prisoner_id: prisonerId,
        ...data.personal,
        created_by: user,
        updated_by: user,
        created_at: now,
        updated_at: now,
      };
      mockPersonals.push(personal);
    }

    if (data.penitentiary) {
      const penitentiary: Penitentiary = {
        id: generateId(),
        prisoner_id: prisonerId,
        ...data.penitentiary,
        created_by: user,
        updated_by: user,
        created_at: now,
        updated_at: now,
      };
      mockPenitentiaries.push(penitentiary);
    }

    if (data.contacts && data.contacts.length > 0) {
      data.contacts.forEach((contactData) => {
        const contact: Contact = {
          id: generateId(),
          prisoner_id: prisonerId,
          ...contactData,
          created_by: user,
          updated_by: user,
          created_at: now,
          updated_at: now,
        };
        mockContacts.push(contact);
      });
    }

    notifications.show({
      title: "¡Éxito!",
      message: `Prisionero ${data.identity?.first_name || "sin nombre"} registrado correctamente`,
      color: "green"
    });

    console.log("🎉 Prisionero completo creado:", { prisoner, id: prisonerId });
    return { prisoner, id: prisonerId };
  },

  async createPrisoner(data: CreatePrisonerDTO): Promise<PrisonerBase> {
    await delay();

    const now = getCurrentTimestamp();
    const user = getCurrentUser();

    const prisoner: PrisonerBase = {
      id: generateId(),
      registration_number: data.registration_number,
      admission_date: data.admission_date,
      fiscal_file_number: data.fiscal_file_number,
      status: data.status || "Activo",
      created_by: user,
      updated_by: user,
      created_at: now,
      updated_at: now,
    };

    mockPrisoners.push(prisoner);
    console.log("🟢 Prisionero creado:", prisoner);
    return prisoner;
  },

  async getPrisoners(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}): Promise<{
    data: PrisonerBase[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    await delay();

    const { page = 1, limit = 10, status, search } = params;

    let filtered = [...mockPrisoners];

    if (status && status !== "all") {
      filtered = filtered.filter((p) => p.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.registration_number.toLowerCase().includes(searchLower) ||
          p.fiscal_file_number?.toLowerCase().includes(searchLower)
      );
    }

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const data = filtered.slice(startIndex, startIndex + limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  },

  async getPrisoner(id: string): Promise<PrisonerBase | null> {
    await delay();
    return mockPrisoners.find((p) => p.id === id) || null;
  },

  async getCompleteProfile(prisonerId: string): Promise<CompletePrisonerProfile | null> {
    await delay();

    const prisoner = mockPrisoners.find((p) => p.id === prisonerId);
    if (!prisoner) {
      console.warn('❌ Prisionero no encontrado:', prisonerId);
      return null;
    }

    const identity = mockIdentities.find((i) => i.prisoner_id === prisonerId);
    const personal = mockPersonals.find((p) => p.prisoner_id === prisonerId);
    const penitentiary = mockPenitentiaries.find((p) => p.prisoner_id === prisonerId);
    const contacts = mockContacts.filter((c) => c.prisoner_id === prisonerId);

    const profile: CompletePrisonerProfile = {
      prisoner,
      identity: identity || undefined,
      personal: personal || undefined,
      penitentiary: penitentiary || undefined,
      contacts,
      medical_records: mockMedicalRecords.filter((m) => m.prisoner_id === prisonerId),
      belongings: mockBelongings.filter((b) => b.prisoner_id === prisonerId),
      children: mockChildren.filter((c) => c.prisoner_id === prisonerId),
    };

    console.log('✅ Perfil completo obtenido:', profile);
    return profile;
  },

  async getPrisonersWithNames(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}): Promise<{
    data: (PrisonerBase & { fullName?: string })[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    await delay();
    
    const { page = 1, limit = 10, status, search } = params;
    
    let filtered = [...mockPrisoners];
    
    if (status && status !== 'all') {
      filtered = filtered.filter(p => p.status === status);
    }
    
    const withNames = filtered.map(prisoner => {
      const identity = mockIdentities.find(i => i.prisoner_id === prisoner.id);
      const fullName = identity ? `${identity.first_name} ${identity.surname}` : undefined;
      
      return {
        ...prisoner,
        fullName
      };
    });
    
    let searchFiltered = withNames;
    if (search) {
      const searchLower = search.toLowerCase();
      searchFiltered = withNames.filter(p => 
        p.registration_number.toLowerCase().includes(searchLower) ||
        p.fiscal_file_number?.toLowerCase().includes(searchLower) ||
        p.fullName?.toLowerCase().includes(searchLower)
      );
    }
    
    const total = searchFiltered.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const data = searchFiltered.slice(startIndex, startIndex + limit);
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }
};

export const populateMockData = (): void => {
  console.log('🎭 Poblando datos mock para demostración...');
  console.log(`📊 Datos agregados:
    - ${mockPrisoners.length} prisioneros
    - ${mockIdentities.length} identidades  
    - ${mockPersonals.length} información personal
    - ${mockPenitentiaries.length} ubicaciones penitenciarias
    - ${mockContacts.length} contactos
  `);
};

export const clearMockData = (): void => {
  mockPrisoners.length = 0;
  mockIdentities.length = 0;
  mockPersonals.length = 0;
  mockPenitentiaries.length = 0;
  mockContacts.length = 0;
  mockMedicalRecords.length = 0;
  mockBelongings.length = 0;
  mockChildren.length = 0;
  console.log('🧹 Datos mock limpiados');
};

populateMockData();

if (typeof window !== 'undefined' && import.meta.env.DEV) {
  (window as any).prisonersDebug = {
    get data() {
      return {
        prisoners: mockPrisoners,
        identities: mockIdentities,
        personals: mockPersonals,
        penitentiaries: mockPenitentiaries,
        contacts: mockContacts,
        stats: {
          total: mockPrisoners.length,
          activos: mockPrisoners.filter(p => p.status === 'Activo').length,
          trasladados: mockPrisoners.filter(p => p.status === 'Trasladado').length,
          liberados: mockPrisoners.filter(p => p.status === 'Liberado').length,
        }
      };
    },
    clearAll: clearMockData,
    populate: populateMockData
  };
  
  console.log(`
  🎭 DATOS MOCK CARGADOS
  
📊 Estadísticas:
  • Total: ${mockPrisoners.length} prisioneros
  • Activos: ${mockPrisoners.filter(p => p.status === 'Activo').length}
  • Trasladados: ${mockPrisoners.filter(p => p.status === 'Trasladado').length}
  • Liberados: ${mockPrisoners.filter(p => p.status === 'Liberado').length}
  
  🔧 Comandos disponibles en consola:
  • prisonersDebug.data - Ver todos los datos
  • prisonersDebug.clearAll() - Limpiar datos
  • prisonersDebug.populate() - Repoblar datos
  `);
}

export default prisonersApi;