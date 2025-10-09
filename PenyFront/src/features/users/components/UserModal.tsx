import { Modal, TextInput, Select, Button, Group, Stack, PasswordInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect } from 'react';

interface UserFormData {
  name: string;
  email: string;
  role: string;
  password: string;
}

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastAccess: string;
  createdAt: string;
  avatar?: string;
}

interface UserModalProps {
  opened: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  user?: User | null;
  isLoading?: boolean;
}

const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'director', label: 'Director' },
  { value: 'secretario_general', label: 'Secretario General' },
  { value: 'usuario', label: 'Usuario' }
];

export const UserModal = ({ opened, onClose, onSubmit, user, isLoading = false }: UserModalProps) => {
  const form = useForm<UserFormData>({
    initialValues: {
      name: '',
      email: '',
      role: 'secretario_general',
      password: ''
    },
    validate: {
      name: (value) => {
        if (!value || value.length < 2) {
          return 'El nombre debe tener al menos 2 caracteres';
        }
        return null;
      },
      email: (value) => {
        if (!value) return 'El email es requerido';
        if (!/^\S+@\S+\.\S+$/.test(value)) return 'Email inválido';
        return null;
      },
      role: (value) => (!value ? 'Selecciona un rol' : null),
      password: (value) => {
        // Solo validar contraseña si es un usuario nuevo
        if (!user && (!value || value.length < 6)) {
          return 'La contraseña debe tener al menos 6 caracteres';
        }
        return null;
      },
    },
  });

  // Actualizar valores del formulario cuando cambie el usuario o se abra el modal
  useEffect(() => {
    if (opened) {
      if (user) {
        form.setValues({
          name: user.name,
          email: user.email,
          role: user.role.toLowerCase().replace(/\s+/g, '_'),
          password: ''
        });
      } else {
        form.reset();
      }
    }
    // Suprimir la advertencia de ESLint porque form.setValues y form.reset son estables
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, user]);

  const handleSubmit = (values: UserFormData) => {
    onSubmit(values);
    if (!isLoading) {
      form.reset();
      onClose();
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal 
      opened={opened} 
      onClose={handleClose} 
      title={user ? 'Editar Usuario' : 'Nuevo Usuario'}
      size="md"
      closeOnClickOutside={!isLoading}
      closeOnEscape={!isLoading}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Nombre completo"
            placeholder="Ingresa el nombre completo"
            required
            disabled={isLoading}
            {...form.getInputProps('name')}
          />
          
          <TextInput
            label="Correo electrónico"
            placeholder="usuario@penitenciario.gov"
            type="email"
            required
            disabled={isLoading}
            {...form.getInputProps('email')}
          />
          
          <Select
            label="Rol"
            placeholder="Selecciona un rol"
            required
            disabled={isLoading}
            data={roleOptions}
            {...form.getInputProps('role')}
          />
          
          {!user && (
            <PasswordInput
              label="Contraseña"
              placeholder="Contraseña temporal (mín. 6 caracteres)"
              required
              disabled={isLoading}
              {...form.getInputProps('password')}
            />
          )}
          
          <Group justify="flex-end" mt="md">
            <Button 
              variant="subtle" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              loading={isLoading}
              disabled={isLoading}
            >
              {user ? 'Actualizar Usuario' : 'Crear Usuario'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};
