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
import type { User } from "../../../shared/types/userTypes";
import { ProfilePhotoDropzone } from "../../../shared/components/BelongingDropzone";

const roleOptions = [
  { value: "ADMIN", label: "Administrador" },
  { value: "SECRETARY", label: "Secretario" },
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
          role: user.role ?? "USER",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, user]);

const handleSubmit = (values: Record<string, any>) => {
  const data: CreateUserData = {
    email: values.email,
    password: values.password,
    name: values.name,
    role: values.role,
    photoUrl: photoFile ? URL.createObjectURL(photoFile) : undefined,
    // Si quieres enviar los campos extra, agrégalos aquí
    cellphone: values.cellphone,
    ci: values.ci,
    department: values.department,
    departmentalDirectorateUnit: values.departmentalDirectorateUnit,
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
          <TextInput
            label="Celular"
            placeholder="No disponible"
            disabled={isLoading}
            {...form.getInputProps("cellphone")}
          />
          <TextInput
            label="CI"
            placeholder="No disponible"
            disabled={isLoading}
            {...form.getInputProps("ci")}
          />
          <TextInput
            label="Departamento"
            placeholder="No disponible"
            disabled={isLoading}
            {...form.getInputProps("department")}
          />
          <TextInput
            label="Unidad/Dirección Departamental"
            placeholder="No disponible"
            disabled={isLoading}
            {...form.getInputProps("departmentalDirectorateUnit")}
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
