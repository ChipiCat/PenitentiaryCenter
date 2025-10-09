import { 
  Group, 
  Button, 
  Text,
  Badge,
  Stack,
  Paper
} from '@mantine/core';
import { 
  Home, 
  Users, 
  FileText, 
  UserCog, 
  Activity 
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import { getRoleColor } from '../utils/userUtils';

const iconMap = {
  home: Home,
  users: Users,
  'file-text': FileText,
  'user-cog': UserCog,
  activity: Activity
} as const;

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getNavigationLinks, currentUser, isAuthenticated } = usePermissions();

  // Si no está autenticado, no mostrar navegación
  if (!isAuthenticated || !currentUser) {
    return null;
  }

  const navigationLinks = getNavigationLinks();

  return (
    <Paper p="md" withBorder mb="lg">
      <Stack gap="md">
        {/* Información del usuario */}
        <Group justify="space-between">
          <div>
            <Text size="sm" fw={500}>Bienvenido, {currentUser.name}</Text>
            <Group gap="xs">
              <Text size="xs" c="dimmed">Rol:</Text>
              <Badge 
                size="xs" 
                color={getRoleColor(currentUser.role)}
                variant="light"
              >
                {currentUser.roleLabel}
              </Badge>
            </Group>
          </div>
        </Group>

        {/* Enlaces de navegación */}
        <Group gap="xs">
          {navigationLinks.map((link) => {
            const Icon = iconMap[link.icon as keyof typeof iconMap];
            const isActive = location.pathname === link.path;

            return (
              <Button
                key={link.path}
                variant={isActive ? 'filled' : 'light'}
                leftSection={<Icon size={16} />}
                onClick={() => navigate(link.path)}
                size="sm"
              >
                {link.label}
              </Button>
            );
          })}
        </Group>
      </Stack>
    </Paper>
  );
};