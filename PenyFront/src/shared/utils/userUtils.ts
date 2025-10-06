export const getRoleLabel = (role: string) => {
    switch (role.toLocaleLowerCase()) {
        case 'admin':
            return 'Administrador';
        case 'user':
            return 'Usuario';
        case 'supervisor':
            return 'Supervisor';
        default:
            return 'Desconocido';
    }
}