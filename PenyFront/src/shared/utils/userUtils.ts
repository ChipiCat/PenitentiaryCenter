export const getRoleLabel = (role: string) => {
    switch (role.toLowerCase()) {
        case 'admin':
            return 'Administrador';
        case 'secretario general':
            return 'Secretario';
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