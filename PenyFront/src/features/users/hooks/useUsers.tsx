import { useEffect, useState, useCallback } from "react";
import { usersService } from "../../../shared/services/userService";
import type { User } from "../../../shared/types/userResponse";
import type { PaginationResponse } from "../../../shared/types/axiosTypes";
import type { GetUsersParams, CreateUserData, UpdateUserData } from "../../../shared/types/userTypes";

export function useUsers(params?: GetUsersParams) {
  const [data, setData] = useState<PaginationResponse<User> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>({ total: 0, activos: 0, inactivos: 0 });

  // Cargar usuarios y stats
  const fetchUsers = useCallback(() => {
    setLoading(true);
    usersService.getUsers(params)
      .then((res) => {
        setData(res);
        const usuarios = res.items ?? [];
        setStats({
          total: usuarios.length,
          activos: usuarios.filter((u: User) => !u.isDeleted).length,
          inactivos: usuarios.filter((u: User) => u.isDeleted).length,
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Crear usuario
  const handleNewUser = async (data: CreateUserData) => {
    await usersService.createUser(data);
    fetchUsers();
  };

  // Editar usuario
  const handleEditUser = async (id: string, data: UpdateUserData) => {
    await usersService.updateUser(id, data);
    fetchUsers();
  };

  // Eliminar usuario
  const handleDeleteUser = async (id: string) => {
    await usersService.deleteUser(id);
    fetchUsers();
  };

  return {
    stats,
    users: data?.items ?? [],
    handleNewUser,
    handleEditUser,
    handleDeleteUser,
    loading,
    error,
    pagination: data,
  };
}