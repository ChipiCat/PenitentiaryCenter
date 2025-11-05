import React from "react";
import {
    Box,
    Button,
    Paper,
    PasswordInput,
    useMantineTheme,
    Alert,
} from "@mantine/core";
import { useState } from "react";
import { KeyRound, LockKeyhole } from 'lucide-react';
import { updatePassword } from "../../../shared/services";
import { useNavigate } from "react-router";
import { ROUTES } from "../../../shared/config";
import { useGlobalContext } from "../../../shared/hooks/useGlobalContext";
import { useAppDispatch } from "../../../shared/store/hooks";
import { logoutThunk } from "../../../shared/store/thunks/authThunk";


const WelcomePage = () => {
    const theme = useMantineTheme();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { refetchUser } = useGlobalContext();
    const navigate = useNavigate();
    const [validationErrors, setValidationErrors] = useState<{
        currentPassword?: string;
        newPassword?: string;
        confirmPassword?: string;
    }>({});
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    const validateCurrentPassword = (password: string): string | undefined => {
        if (!password) return "La contraseña actual es obligatoria";
        if (password.length < 8) return "Debe tener al menos 8 caracteres";
        return undefined;
    };
    const validateNewPassword = (password: string): string | undefined => {
        if (!password) return "La nueva contraseña es obligatoria";
        if (password.length < 8) return "Debe tener al menos 8 caracteres";
        return undefined;
    };
    const validateConfirmPassword = (password: string, newPassword: string): string | undefined => {
        if (!password) return "Confirma la nueva contraseña";
        if (password !== newPassword) return "Las contraseñas no coinciden";
        return undefined;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const currentPasswordError = validateCurrentPassword(currentPassword);
        const newPasswordError = validateNewPassword(newPassword);
        const confirmPasswordError = validateConfirmPassword(confirmPassword, newPassword);
        if (currentPasswordError || newPasswordError || confirmPasswordError) {
            setValidationErrors({
                currentPassword: currentPasswordError,
                newPassword: newPasswordError,
                confirmPassword: confirmPasswordError,
            });
            return;
        }
        setValidationErrors({});
        setStatus('loading');
        setError(null);
        const success = await updatePassword(currentPassword, newPassword);
        if (success) {
            setStatus('success');
            await refetchUser();
            navigate(ROUTES.HOME);
        } else {
            setStatus('error');
            setError('No se pudo actualizar la contraseña. Verifica tus datos.');
        }
    };

    const dispatch = useAppDispatch();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const { user } = useGlobalContext();
     const handleLogout = async () => {
        setIsLoggingOut(true);
        await dispatch(logoutThunk());
        setIsLoggingOut(false);
      };

    return (
        <Box
            style={{
                minHeight: "100vh",
                background: theme.colors[theme.primaryColor][6],
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Paper shadow="sm" p={22} mt={30} radius="md" style={{ width: "100%", maxWidth: 350 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <img src="/assets/LogoPolicia.png" alt="Logo Policia" style={{ height: 64 }} />
                </div>
                <p className="text-center font-bold text-xl !mb-0">
                    SIGEPEN
                </p>
                <p className="text-center text-sm mb-4 font-extralight text-gray-600 mt-1">
                    Actualiza tu contraseña
                </p>
                <p className="text-center text-sm mb-4 font-extralight text-gray-600 mt-1">
                    Usuario: {user?.name}
                </p>
                <form onSubmit={handleSubmit}>
                    <PasswordInput
                        label="Contraseña actual"
                        placeholder="Ingresa tu contraseña actual"
                        required
                        radius="md"
                        leftSection={<LockKeyhole size={16} color="#a9b6cd" />}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.currentTarget.value)}
                        error={validationErrors.currentPassword}
                    />
                    <PasswordInput
                        label="Nueva contraseña"
                        placeholder="Mínimo 8 caracteres"
                        required
                        mt="md"
                        radius="md"
                        leftSection={<KeyRound size={16} color="#a9b6cd" />}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.currentTarget.value)}
                        error={validationErrors.newPassword}
                    />
                    <PasswordInput
                        label="Confirmar nueva contraseña"
                        placeholder="Repite la nueva contraseña"
                        required
                        mt="md"
                        radius="md"
                        leftSection={<KeyRound size={16} color="#a9b6cd" />}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.currentTarget.value)}
                        error={validationErrors.confirmPassword}
                    />

                    {error && (
                        <Alert color="red" mt="md" radius="md">
                            {error}
                        </Alert>
                    )}
                    {status === 'success' && (
                        <Alert color="green" mt="md" radius="md">
                            Contraseña actualizada correctamente
                        </Alert>
                    )}

                    <Button
                        fullWidth
                        mt="xl"
                        radius="md"
                        leftSection={<KeyRound size={16} />}
                        type="submit"
                        loading={status === "loading"}
                    >
                        Actualizar contraseña
                    </Button>
                   
                </form>
                  <Button
                        fullWidth
                        mt="xl"
                        radius="md"
                        leftSection={<KeyRound size={16} />}
                        variant="outline"
                        loading={isLoggingOut}
                        onClick={handleLogout}
                    >
                        Cerrar sesión
                    </Button>
            </Paper>
        </Box>
    );
};

export default WelcomePage;
