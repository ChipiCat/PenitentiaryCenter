
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
        photoUrl: string;
    }
}