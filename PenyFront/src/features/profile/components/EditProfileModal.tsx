import {
  Modal,
  TextInput,
  Select,
  Button,
  Group,
  Stack,
  Divider,
  Box,
  Loader,
  Notification,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useEffect, useState } from "react";
import type { User } from "../../../shared/types/userTypes";
import { ProfilePhotoDropzone } from "../../../shared/components/BelongingDropzone";
import { AlertCircle, Check } from "lucide-react";
import api from "../../../shared/services/api";

const roleOptions = [
  { value: "DIRECTOR", label: "Director" },
  { value: "ADMIN", label: "Administrador" },
  { value: "SECRETARY", label: "Secretario" },
];

interface EditProfileModalProps {
  opened: boolean;
  onClose: () => void;
  user: User | null;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  isLoading?: boolean;
}

export const EditProfileModal = ({
  opened,
  onClose,
  user,
  onSubmit,
  isLoading = false,
}: EditProfileModalProps) => {
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
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
    },
  });

  useEffect(() => {
    if (opened && user) {
      form.setValues({
        name: user.name ?? "",
        email: user.email ?? "",
        role: user.role ?? "ADMIN",
        cellphone: user.cellphone ?? "",
        ci: user.ci ?? "",
        department: user.department ?? "",
        departmentalDirectorateUnit: user.departmentalDirectorateUnit ?? "",
      });
      setPhotoFile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, user]);

  const handleSubmit = async (values: any) => {
    try {
      let photoFileId: string | undefined = undefined;

      // If a photo file is selected, upload it first
      if (photoFile) {
        const formData = new FormData();
        formData.append("file", photoFile);
        const uploadResponse = await api.post<{ id: string }>(
          `/users/${user?.id}/upload-photo`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' }
          }
        );
        photoFileId = uploadResponse.data.id;
      }

      // Prepare the update data
      const updateData: Record<string, any> = {
        name: values.name,
        email: values.email,
        role: values.role,
      };

      if (values.cellphone) updateData.cellphone = values.cellphone;
      if (values.ci) updateData.ci = values.ci;
      if (values.department) updateData.department = values.department;
      if (values.departmentalDirectorateUnit) {
        updateData.departmentalDirectorateUnit = values.departmentalDirectorateUnit;
      }
      if (photoFileId) updateData.photoFileId = photoFileId;

      // Call the update handler with the prepared data
      await onSubmit(updateData);
      
      setNotification({
        type: "success",
        message: "Perfil actualizado correctamente",
      });
      
      setTimeout(() => {
        setNotification(null);
        onClose();
      }, 2000);
    } catch (error) {
      setNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Error al actualizar perfil",
      });
    }
  };

  const handleClose = () => {
    form.reset();
    setPhotoFile(null);
    setNotification(null);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Editar Información Personal"
      size="lg"
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
      radius="md"
      padding="lg"
      centered
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {notification && (
            <Notification
              icon={
                notification.type === "success" ? (
                  <Check size={16} />
                ) : (
                  <AlertCircle size={16} />
                )
              }
              color={notification.type === "success" ? "green" : "red"}
              title={notification.type === "success" ? "Éxito" : "Error"}
              onClose={() => setNotification(null)}
              closeButtonProps={{ "aria-label": "Cerrar notificación" }}
            >
              {notification.message}
            </Notification>
          )}

          <Box>
            <Divider
              my="xs"
              label="Foto de Perfil"
              labelPosition="center"
            />
            <Group justify="center" mt="md">
              <ProfilePhotoDropzone onFile={setPhotoFile} />
            </Group>
          </Box>

          <Divider
            my="xs"
            label="Información Básica"
            labelPosition="center"
          />

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

          <Divider
            my="xs"
            label="Información Laboral"
            labelPosition="center"
          />

          <Group grow>
            <Select
              label="Rol del Usuario"
              placeholder="Selecciona un rol"
              required
              disabled={isLoading}
              data={roleOptions}
              {...form.getInputProps("role")}
            />
            <TextInput
              label="Celular"
              placeholder="Ej: +591 12345678"
              disabled={isLoading}
              {...form.getInputProps("cellphone")}
            />
          </Group>

          <Group grow>
            <TextInput
              label="CI"
              placeholder="Ej: 1234567"
              disabled={isLoading}
              {...form.getInputProps("ci")}
            />
            <TextInput
              label="Departamento"
              placeholder="Ej: Santa Cruz"
              disabled={isLoading}
              {...form.getInputProps("department")}
            />
          </Group>

          <TextInput
            label="Unidad/Dirección Departamental"
            placeholder="Ej: Dirección Regional Norte"
            disabled={isLoading}
            {...form.getInputProps("departmentalDirectorateUnit")}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={handleClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              loading={isLoading} 
              disabled={isLoading}
              leftSection={isLoading ? <Loader size={16} color="white" /> : undefined}
            >
              Guardar Cambios
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
