import {
  Box,
  Button,
  Paper,
  PasswordInput,
  TextInput,
  useMantineTheme,
  Alert,
} from "@mantine/core";
import { useState } from "react";
import { LogIn, User, LockKeyhole } from 'lucide-react';
import { useAppDispatch, useAppSelector } from "../../shared/store/hooks";
import { loginThunk } from "../../shared/store/thunks/authThunk";

const LoginPage = () => {
  const theme = useMantineTheme();
  const dispatch = useAppDispatch();
  const { status, error } = useAppSelector((state) => state.user);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const validateEmail = (email: string): string | undefined => {
    if (!email) return "El correo es obligatorio";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Formato de correo inválido";
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "La contraseña es obligatoria";
    if (password.length < 8) return "La contraseña debe tener al menos 8 caracteres";
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    if (emailError || passwordError) {
      setValidationErrors({
        email: emailError,
        password: passwordError,
      });
      return;
    }

    setValidationErrors({});

    // Solo despachamos la acción, la redirección se maneja automáticamente por PublicRoute
    await dispatch(loginThunk({ email, password }));
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
          Centro Penitenciario
        </p>
        <p className="text-center text-sm mb-4 font-extralight text-gray-600 mt-1">
          Sistema de Gestión Interna
        </p>
        
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Correo"
            placeholder="usuario@empresa.com"
            required
            radius="md"
            leftSection={<User size={16} color="#a9b6cd" />}
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            error={validationErrors.email}
          />
          <PasswordInput
            label="Contraseña"
            placeholder="Mínimo 8 caracteres"
            required
            mt="md"
            radius="md"
            leftSection={<LockKeyhole size={16} color="#a9b6cd" />}
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            error={validationErrors.password}
          />

          {error && (
            <Alert color="red" mt="md" radius="md">
              {error}
            </Alert>
          )}

          <Button
            fullWidth
            mt="xl"
            radius="md"
            leftSection={<LogIn size={16} />}
            type="submit"
            loading={status === "loading"}
          >
            Iniciar sesión
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default LoginPage;
