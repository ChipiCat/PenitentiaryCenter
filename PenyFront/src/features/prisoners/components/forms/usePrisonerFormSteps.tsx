import { User, Users, Building, Phone, Stethoscope, Gavel } from 'lucide-react';

export function usePrisonerFormSteps() {
  return [
    {
      step: 0,
      label: "Información Principal",
      description: "Datos básicos e identidad",
      icon: <User size={20} />
    },
    {
      step: 1,
      label: "Información Personal", 
      description: "Datos familiares y personales",
      icon: <Users size={20} />
    },
    {
      step: 2,
      label: "Examen Médico",
      description: "Datos del examen y referencia médica",
      icon: <Stethoscope size={20} />
    },
    {
      step: 3,
      label: "Ubicación Penitenciaria",
      description: "Edificio, celda y categoría", 
      icon: <Building size={20} />
    },
    {
      step: 4,
      label: "Contactos",
      description: "Contactos de emergencia",
      icon: <Phone size={20} />
    },
    {
      step: 5,
      label: "Tema Legal",
      description: "Información de casos judiciales",
      icon: <Gavel size={20} />
    }
  ];
}