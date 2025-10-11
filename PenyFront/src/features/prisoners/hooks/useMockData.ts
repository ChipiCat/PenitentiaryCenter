import { useMemo } from 'react';
import mockData from '../utils/mockData.json';
import type { Prisoner, PrisonerStatus } from '../types';

// 🔧 Tipo para datos raw del JSON que coincide exactamente con mockData.json
interface RawPrisonerData {
  id: string;
  fullName: string;
  idNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  admissionDate: string;
  age: number;
  birthDate: string;
  gender: string;
  nationality: string;
  crime: string;
  sentence: string;
  remainingSentence: string;
  cellBlock: string;
  legalStatus: string;
  behavior: string;
  workAssignment: string | null; // 🔧 Puede ser null en el JSON
  releaseDate?: string; // 🔧 Opcional, solo presente en liberados
  // 🔧 emergencyContact es un objeto en el JSON
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    address: string;
  };
  // 🔧 medicalInfo es un objeto en el JSON
  medicalInfo: {
    bloodType: string;
    allergies: string;
    medications: string[];
    lastCheckup: string;
  };
  [key: string]: unknown;
}

export const useMockData = () => {
  // 🔧 Función para normalizar status con tipo específico
  const normalizeStatus = (status: string | undefined): PrisonerStatus => {
    if (!status) return 'Activo';
    
    const statusMap: Record<string, PrisonerStatus> = {
      'activo': 'Activo',
      'Activo': 'Activo',
      'inactivo': 'Inactivo',
      'Inactivo': 'Inactivo',
      'en proceso': 'En Proceso',
      'En proceso': 'En Proceso',
      'En Proceso': 'En Proceso',
      'liberado': 'Liberado',
      'Liberado': 'Liberado',
      'transferido': 'Transferido',
      'Transferido': 'Transferido'
    };
    
    return statusMap[status] || 'Activo';
  };

  // 🔧 Transformar datos raw del JSON a Prisoner[]
  const allPrisoners = useMemo(() => {
    // 🔧 Cast seguro: primero a unknown, luego a RawPrisonerData[]
    const rawPrisoners = mockData.prisoners as unknown as RawPrisonerData[];
    
    return rawPrisoners.map((rawPrisoner): Prisoner => {
      const currentDate = new Date().toISOString();
      
      // 🔧 Transformar emergencyContact de objeto a propiedades planas
      const emergencyContactName = rawPrisoner.emergencyContact?.name;
      const emergencyPhone = rawPrisoner.emergencyContact?.phone;
      const relationship = rawPrisoner.emergencyContact?.relationship;
      const contactAddress = rawPrisoner.emergencyContact?.address;
      
      // 🔧 Transformar medicalInfo
      const medicalInfo = rawPrisoner.medicalInfo ? {
        bloodType: rawPrisoner.medicalInfo.bloodType,
        allergies: rawPrisoner.medicalInfo.allergies === 'Ninguna' 
          ? [] 
          : [rawPrisoner.medicalInfo.allergies],
        medications: rawPrisoner.medicalInfo.medications || [],
        lastCheckup: rawPrisoner.medicalInfo.lastCheckup
      } : undefined;
      
      // Asegurar que todos los campos requeridos estén presentes
      return {
        // Campos requeridos con fallbacks
        id: rawPrisoner.id,
        fullName: rawPrisoner.fullName || 'Sin nombre',
        idNumber: rawPrisoner.idNumber || '',
        age: rawPrisoner.age || 0,
        status: normalizeStatus(rawPrisoner.status),
        createdAt: rawPrisoner.createdAt || currentDate,
        updatedAt: rawPrisoner.updatedAt || currentDate,
        lastUpdate: rawPrisoner.updatedAt || currentDate, // 🔧 Usar updatedAt como lastUpdate
        
        // Campos opcionales del JSON
        firstName: undefined, // No está en el JSON actual
        lastName: undefined,  // No está en el JSON actual
        identification: rawPrisoner.idNumber, // Usar idNumber como identification
        passport: undefined,
        birthDate: rawPrisoner.birthDate,
        gender: rawPrisoner.gender,
        nationality: rawPrisoner.nationality,
        crime: rawPrisoner.crime,
        sentence: rawPrisoner.sentence,
        cellBlock: rawPrisoner.cellBlock,
        legalStatus: rawPrisoner.legalStatus,
        behavior: rawPrisoner.behavior,
        workAssignment: rawPrisoner.workAssignment || undefined, // 🔧 Convertir null a undefined
        admissionDate: rawPrisoner.admissionDate,
        remainingSentence: rawPrisoner.remainingSentence,
        photo: undefined, // No está en el JSON actual
        
        // 🔧 Información de contacto transformada
        emergencyContact: emergencyContactName,
        emergencyPhone: emergencyPhone,
        relationship: relationship,
        location: contactAddress ? {
          department: undefined,
          city: undefined,
          address: contactAddress
        } : undefined,
        
        // 🔧 Información médica transformada
        medicalInfo: medicalInfo
      };
    });
  }, []);

  const getPrisonerById = useMemo(() => {
    return (id: string): Prisoner | null => {
      return allPrisoners.find(p => p.id === id) || null;
    };
  }, [allPrisoners]);

  const getFilteredPrisoners = useMemo(() => {
    return (searchTerm: string, statusFilter: string | null): Prisoner[] => {
      let filtered = allPrisoners;
      
      if (searchTerm) {
        filtered = filtered.filter(p => 
          p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.idNumber?.includes(searchTerm)
        );
      }
      
      if (statusFilter) {
        filtered = filtered.filter(p => p.status === statusFilter);
      }
      
      return filtered;
    };
  }, [allPrisoners]);

  const getPaginatedPrisoners = useMemo(() => {
    return (prisoners: Prisoner[], page: number, itemsPerPage: number): Prisoner[] => {
      const startIndex = (page - 1) * itemsPerPage;
      return prisoners.slice(startIndex, startIndex + itemsPerPage);
    };
  }, []);

  const getStats = useMemo(() => {
    return () => ({
      total: allPrisoners.length,
      active: allPrisoners.filter(p => p.status === 'Activo').length,
      inProcess: allPrisoners.filter(p => p.status === 'En Proceso').length,
      released: allPrisoners.filter(p => p.status === 'Liberado').length,
      inactive: allPrisoners.filter(p => p.status === 'Inactivo').length,
      transferred: allPrisoners.filter(p => p.status === 'Transferido').length
    });
  }, [allPrisoners]);

  // Funciones de transformación con tipos específicos
  const transformRawData = useMemo(() => {
    return (rawData: RawPrisonerData[]): Prisoner[] => {
      return rawData.map((prisoner): Prisoner => {
        const currentDate = new Date().toISOString();
        
        // Transformar emergencyContact
        const emergencyContactName = prisoner.emergencyContact?.name;
        const emergencyPhone = prisoner.emergencyContact?.phone;
        const relationship = prisoner.emergencyContact?.relationship;
        const contactAddress = prisoner.emergencyContact?.address;
        
        // Transformar medicalInfo
        const medicalInfo = prisoner.medicalInfo ? {
          bloodType: prisoner.medicalInfo.bloodType,
          allergies: prisoner.medicalInfo.allergies === 'Ninguna' 
            ? [] 
            : [prisoner.medicalInfo.allergies],
          medications: prisoner.medicalInfo.medications || [],
          lastCheckup: prisoner.medicalInfo.lastCheckup
        } : undefined;
        
        return {
          // Campos requeridos
          id: prisoner.id,
          fullName: prisoner.fullName || 'Sin nombre',
          idNumber: prisoner.idNumber || '',
          age: prisoner.age || 0,
          status: normalizeStatus(prisoner.status),
          createdAt: prisoner.createdAt || currentDate,
          updatedAt: prisoner.updatedAt || currentDate,
          lastUpdate: prisoner.updatedAt || currentDate,
          
          // Campos opcionales
          firstName: undefined,
          lastName: undefined,
          identification: prisoner.idNumber,
          passport: undefined,
          birthDate: prisoner.birthDate,
          gender: prisoner.gender,
          nationality: prisoner.nationality,
          crime: prisoner.crime,
          sentence: prisoner.sentence,
          cellBlock: prisoner.cellBlock,
          legalStatus: prisoner.legalStatus,
          behavior: prisoner.behavior,
          workAssignment: prisoner.workAssignment || undefined,
          admissionDate: prisoner.admissionDate,
          remainingSentence: prisoner.remainingSentence,
          photo: undefined,
          emergencyContact: emergencyContactName,
          emergencyPhone: emergencyPhone,
          relationship: relationship,
          location: contactAddress ? {
            department: undefined,
            city: undefined,
            address: contactAddress
          } : undefined,
          medicalInfo: medicalInfo
        };
      });
    };
  }, []);

  const searchPrisoners = useMemo(() => {
    return (prisoners: Prisoner[], searchTerm: string): Prisoner[] => {
      if (!searchTerm.trim()) return prisoners;
      
      const term = searchTerm.toLowerCase();
      return prisoners.filter(prisoner => 
        prisoner.fullName?.toLowerCase().includes(term) ||
        prisoner.idNumber?.toLowerCase().includes(term) ||
        prisoner.firstName?.toLowerCase().includes(term) ||
        prisoner.lastName?.toLowerCase().includes(term) ||
        prisoner.identification?.toLowerCase().includes(term)
      );
    };
  }, []);

  // Función para filtrar por múltiples criterios
  const advancedFilter = useMemo(() => {
    return (
      prisoners: Prisoner[], 
      filters: {
        searchTerm?: string;
        status?: PrisonerStatus | null;
        ageRange?: { min: number; max: number };
        cellBlock?: string;
        behavior?: string;
      }
    ): Prisoner[] => {
      let filtered = prisoners;

      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(p => 
          p.fullName?.toLowerCase().includes(term) ||
          p.idNumber?.toLowerCase().includes(term) ||
          p.firstName?.toLowerCase().includes(term) ||
          p.lastName?.toLowerCase().includes(term)
        );
      }

      if (filters.status) {
        filtered = filtered.filter(p => p.status === filters.status);
      }

      if (filters.ageRange) {
        filtered = filtered.filter(p => 
          p.age >= filters.ageRange!.min && p.age <= filters.ageRange!.max
        );
      }

      if (filters.cellBlock) {
        filtered = filtered.filter(p => 
          p.cellBlock?.toLowerCase().includes(filters.cellBlock!.toLowerCase())
        );
      }

      if (filters.behavior) {
        filtered = filtered.filter(p => p.behavior === filters.behavior);
      }

      return filtered;
    };
  }, []);

  // Función para ordenar con tipo específico
  const sortPrisoners = useMemo(() => {
    return (
      prisoners: Prisoner[], 
      sortBy: keyof Prisoner, 
      direction: 'asc' | 'desc' = 'asc'
    ): Prisoner[] => {
      return [...prisoners].sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];

        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return direction === 'asc' ? 1 : -1;
        if (bValue === undefined) return direction === 'asc' ? -1 : 1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return direction === 'asc' ? aValue - bValue : bValue - aValue;
        }

        return 0;
      });
    };
  }, []);

  return {
    allPrisoners,
    getPrisonerById,
    getFilteredPrisoners,
    getPaginatedPrisoners,
    getStats,
    transformRawData,
    searchPrisoners,
    advancedFilter,
    sortPrisoners,
    normalizeStatus
  };
};