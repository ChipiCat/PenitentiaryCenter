export const getRoleLabel = (role: string) => {
    switch (role.toUpperCase()) {
        case 'ADMIN':
            return 'Administrador';
        case 'SECRETARY':
            return 'Secretario';
        case 'DIRECTOR':
            return 'Director';
        default:
            return 'Desconocido';
    }
};

// Función adicional para obtener el color del badge según el rol
export const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
        case 'admin':
            return 'blue';
        case 'secretario general':
            return 'green';
        default:
            return 'gray';
    }
};