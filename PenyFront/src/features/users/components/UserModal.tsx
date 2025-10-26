import {
  Modal,
  TextInput,
  Select,
  Button,
  Group,
  Stack,
  PasswordInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import type { CreateUserData } from "../../../shared/types/userTypes";
import type { User } from "../../../shared/types/userResponse";
import { ProfilePhotoDropzone } from "../../../shared/components/BelongingDropzone";

const roleOptions = [
  { value: "ADMIN", label: "Administrador" },
  { value: "DIRECTOR", label: "Director" },
  { value: "SECRETARY", label: "Secretario" },
  { value: "USER", label: "Usuario" },
];

interface UserModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserData) => void;
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
      role: "USER",
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
        !value || value.length < 6
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
          role: user.role ?? "USER",
          password: "", // No se muestra la contraseña actual
        });
      } else {
        form.reset();
      }
      setPhotoFile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, user]);

  const handleSubmit = (values: CreateUserData) => {
    const data: CreateUserData = {
      ...values,
      photoUrl: photoFile ? URL.createObjectURL(photoFile) : undefined,
    };
    onSubmit(data);
    if (!isLoading) {
      form.reset();
      setPhotoFile(null);
      onClose();
    }
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
      title={user ? "Editar Usuario" : "Nuevo Usuario"}
      size="md"
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <Group justify="center">
            <ProfilePhotoDropzone onFile={setPhotoFile} />
          </Group>
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
          <Select
            label="Rol"
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
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" loading={isLoading} disabled={isLoading}>
              {user ? "Actualizar Usuario" : "Crear Usuario"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
