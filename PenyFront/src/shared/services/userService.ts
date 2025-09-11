import type { User } from "../types/userResponse";
import { handleApiError } from "../utils/handleApiError";
import api from "./api";

export const getUserById = async (id: string): Promise<User | null> => {
    try {
        const response = await api.get<User>(`/users/${id}`);
        return response.data;
    } catch (error) {
        handleApiError(error, "getUserById");
        return null;
    }
}

