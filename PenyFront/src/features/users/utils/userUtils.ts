export const getUserInitials = (name: string): string => {
  return name.split(' ').map(n => n[0]).join('').substring(0, 2);
};

export const getRoleColor = (role: string): string => {
  if (role.toLowerCase().includes('director')) return 'blue';
  if (role.toLowerCase().includes('secretario')) return 'green';
  return 'gray';
};

export const getStatusColor = (status: string): string => {
  return status === 'active' ? 'green' : 'red';
};

export const getStatusLabel = (status: string): string => {
  return status === 'active' ? 'Activo' : 'Inactivo';
};