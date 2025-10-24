import type { SelectOption } from '../../../shared/types/report/reportTypes';

export const crimeTypeOptions: SelectOption[] = [
  { value: 'all', label: 'Todos los delitos' },
  { value: 'robbery', label: 'Robo' },
  { value: 'assault', label: 'Asalto' },
  { value: 'fraud', label: 'Fraude' },
  { value: 'drugs', label: 'Narcóticos' },
  { value: 'homicide', label: 'Homicidio' },
  { value: 'other', label: 'Otros' }
];

export const processStatusOptions: SelectOption[] = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'investigation', label: 'En Investigación' },
  { value: 'trial', label: 'En Juicio' },
  { value: 'sentenced', label: 'Sentenciado' },
  { value: 'appeal', label: 'En Apelación' }
];

export const genderOptions: SelectOption[] = [
  { value: 'all', label: 'Todos' },
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' }
];
