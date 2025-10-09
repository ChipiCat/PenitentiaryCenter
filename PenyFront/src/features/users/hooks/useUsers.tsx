import type { UserStat, User } from '../types/userTypes';
import { Users, Shield } from 'lucide-react';

export const useUsers = () => {
  // Datos simulados - en una app real vendrían de una API
  const stats: UserStat[] = [
    {
      title: 'Total de Usuarios',
      value: 3,
      subtitle: 'Sistema completo',
      color: 'purple',
      icon: <Users size={20} />
    },
    {
      title: 'Usuarios Activos',
      value: 3,
      subtitle: 'En línea hoy',
      color: 'green',
      icon: <Users size={20} />
    },
    {
      title: 'Administradores',
      value: 1,
      subtitle: 'Acceso completo',
      color: 'pink',
      icon: <Shield size={20} />
    }
  ];

  const users: User[] = [
    {
      id: '1',
      name: 'William García Vargas',
      username: '@director',
      email: 'director@penitenciario.gov',
      role: 'Director',
      status: 'active',
      lastAccess: '2024-01-25 09:30:15',
      createdAt: '2020-01-15',
      avatar: undefined
    },
    {
      id: '2',
      name: 'María Elena Rodríguez López',
      username: '@secretario',
      email: 'secretario@penitenciario.gov',
      role: 'Secretario General',
      status: 'active',
      lastAccess: '2024-01-25 08:45:22',
      createdAt: '2021-03-20',
      avatar: undefined
    },
    {
      id: '3',
      name: 'Carlos Alberto Mendoza Silva',
      username: '@secretario2',
      email: 'secretario2@penitenciario.gov',
      role: 'Secretario General',
      status: 'active',
      lastAccess: '2024-01-24 16:20:10',
      createdAt: '2022-08-12',
      avatar: undefined
    }
  ];

  const handleNewUser = () => {
    console.log('Crear nuevo usuario');
  };

  const handleEditUser = (userId: string) => {
    console.log('Editar usuario:', userId);
  };

  const handleDeleteUser = (userId: string) => {
    console.log('Eliminar usuario:', userId);
  };

  return {
    stats,
    users,
    handleNewUser,
    handleEditUser,
    handleDeleteUser,
  };
};