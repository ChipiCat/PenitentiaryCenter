import {
  Modal,
  TextInput,
  Select,
  Button,
  Group,
  Stack,
  PasswordInput,
  Divider,
  Text,
  Box,
  Loader,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import type { CreateUserData } from "../../../shared/types/userTypes";
import type { User } from "../../../shared/types/userTypes";
import { ProfilePhotoDropzone } from "../../../shared/components/BelongingDropzone";

const roleOptions = [
  { value: "DIRECTOR", label: "Director" },
  { value: "ADMIN", label: "Administrador" },
  { value: "SECRETARY", label: "Secretario" },
];

interface UserModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserData | FormData) => void;
  isLoading?: boolean;
  user?: User | null;
}

export const UserModal = ({
  opened,
  onClose,
  onSubmit,
  isLoading = false,
  user = null,
}: UserModalProps) => {
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const form = useForm<CreateUserData>({
    initialValues: {
      name: "",
      email: "",
      password: "",
      role: "ADMIN",
      cellphone: "",
      ci: "",
      department: "",
      departmentalDirectorateUnit: "",
    },
    validate: {
      name: (value: string) =>
        !value || value.length < 2
          ? "El nombre debe tener al menos 2 caracteres"
          : null,
      email: (value: string) => {
        if (!value) return "El email es requerido";
        if (!/^\S+@\S+\.\S+$/.test(value)) return "Email inválido";
        return null;
      },
      role: (value: string) => (!value ? "Selecciona un rol" : null),
      password: (value: string) =>
        !user && (!value || value.length < 6)
          ? "La contraseña debe tener al menos 6 caracteres"
          : null,
    },
  });

  useEffect(() => {
    if (opened) {
      if (user) {
        form.setValues({
          name: user.name ?? "",
          email: user.email ?? "",
          role: user.role ?? "ADMIN",
          password: "",
          cellphone: user.cellphone ?? "",
          ci: user.ci ?? "",
          department: user.department ?? "",
          departmentalDirectorateUnit: user.departmentalDirectorateUnit ?? "",
        });
      } else {
        form.reset();
      }
      setPhotoFile(null);
    }

  }, [opened, user]);

  const handleSubmit = async (values: CreateUserData) => {
    // Construir FormData para ambos casos (crear y editar)
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("role", values.role);
    if (values.cellphone) formData.append("cellphone", values.cellphone);
    if (values.ci) formData.append("ci", values.ci);
    if (values.department) formData.append("department", values.department);
    if (values.departmentalDirectorateUnit) formData.append("departmentalDirectorateUnit", values.departmentalDirectorateUnit);
    if (photoFile) formData.append("photo", photoFile);
    
    // Llamar a onSubmit desde la página, que maneja todo
    onSubmit(formData as any);
  };

  const handleClose = () => {
    form.reset();
    setPhotoFile(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={user ? "Editar información del usuario" : "Registrar nuevo usuario"}
      size="lg"
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
      radius="md"
      padding="lg"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Group justify="center" mb="xs">
            <ProfilePhotoDropzone onFile={setPhotoFile} />
          </Group>
          {user && (
            <Box mb="xs">
              <Divider
                my="xs"
                label="Datos del usuario"
                labelPosition="center"
              />
              <Group gap="xs" grow>
                <Text size="sm">
                  <b>Actualización:</b>{" "}
                  {user.updatedAt
                    ? new Date(user.updatedAt).toLocaleString()
                    : "-"}
                </Text>
              </Group>
            </Box>
          )}
          <Group grow>
            <TextInput
              label="Nombre completo"
              placeholder="Nombre y apellido"
              required
              disabled={isLoading}
              {...form.getInputProps("name")}
            />
            <TextInput
              label="Correo electrónico"
              placeholder="usuario@penitenciario.gov"
              type="email"
              required
              disabled={isLoading}
              {...form.getInputProps("email")}
            />
          </Group>
          <Group grow>
            <Select
              label="Rol del Usuario"
              placeholder="Selecciona un rol"
              required
              disabled={isLoading}
              data={roleOptions}
              {...form.getInputProps("role")}
            />
            <PasswordInput
              label="Contraseña"
              placeholder="Contraseña (mín. 6 caracteres)"
              required={!user}
              disabled={isLoading}
              {...form.getInputProps("password")}
            />
          </Group>
          <Group grow>
            <TextInput
              label="Celular"
              placeholder="Ej: +591 12345678"
              disabled={isLoading}
              {...form.getInputProps("cellphone")}
            />
            <TextInput
              label="CI"
              placeholder="Ej: 1234567"
              disabled={isLoading}
              {...form.getInputProps("ci")}
            />
          </Group>
          <Group grow>
            <TextInput
              label="Departamento"
              placeholder="Ej: Santa Cruz"
              disabled={isLoading}
              {...form.getInputProps("department")}
            />
            <TextInput
              label="Unidad/Dirección Departamental"
              placeholder="Ej: Dirección Regional Norte"
              disabled={isLoading}
              {...form.getInputProps("departmentalDirectorateUnit")}
            />
          </Group>
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" loading={isLoading} disabled={isLoading} leftSection={isLoading ? <Loader size={16} color="gray" /> : undefined}>
              {user ? "Actualizar Usuario" : "Crear Usuario"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
