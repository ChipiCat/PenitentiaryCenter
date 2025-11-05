import { useEffect, useState, useCallback } from "react";
import { usersService } from "../../../shared/services/userService";
import { register } from "../../../shared/services/authService";
import type { User, UserStats } from "../../../shared/types";
import type { PaginationResponse } from "../../../shared/types/axiosTypes";
import type { GetUsersParams, UpdateUserData } from "../../../shared/types/userTypes";
import type { RegisterRequest } from "../../../shared/types/authRequest";

export function useUsers(initialFilters: GetUsersParams = {}) {
  const [filters, setFilters] = useState<GetUsersParams>(initialFilters);
  const [data, setData] = useState<PaginationResponse<User> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats>({ total: 0, activos: 0, inactivos: 0 });

  const fetchUsers = useCallback(() => {
    setLoading(true);
    usersService.getUsers(filters)
      .then((res) => {
        setData(res);
        const usuarios = res.data ?? [];
        setStats({
          total: usuarios.length,
          activos: usuarios.filter((u: User) => !u.isDeleted).length,
          inactivos: usuarios.filter((u: User) => u.isDeleted).length,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filters]);

  // Nueva función para paginación controlada desde el componente
  const fetchUsersWithParams = useCallback((params: Partial<GetUsersParams> = {}) => {
    setLoading(true);
    // Solo usa page y size, como espera el backend
    const mergedFilters = { ...filters, ...params };
    usersService.getUsers(mergedFilters)
      .then((res) => {
        setData(res);
        const usuarios = res.data ?? [];
        setStats({
          total: usuarios.length,
          activos: usuarios.filter((u: User) => !u.isDeleted).length,
          inactivos: usuarios.filter((u: User) => u.isDeleted).length,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Crear usuario
  const handleNewUser = async (data: RegisterRequest | FormData) => {
    try {
      await register(data);
      // Refrescar la tabla después de crear usuario
      await fetchUsersWithParams({ page: 1, size: 10 });
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  };

  // Editar usuario
  const handleEditUser = async (id: string, data: UpdateUserData) => {
    try {
      await usersService.updateUser(id, data);
      // Refrescar la tabla después de editar usuario
      await fetchUsersWithParams({ page: 1, size: 10 });
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async (id: string) => {
    try {
      await usersService.deleteUser(id);
      // Refrescar la tabla después de eliminar usuario
      await fetchUsersWithParams({ page: 1, size: 10 });
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  const users = data?.data ?? [];

  return {
    users,
    handleNewUser,
    handleEditUser,
    handleDeleteUser,
    loading,
    error,
    stats,
    setFilters,
    fetchUsers: fetchUsersWithParams, // <-- expón la función para paginación
    total: data?.total ?? 0,
  };
}