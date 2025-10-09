import {
  Group,
  Button,
  Menu,
  ActionIcon,
  Stack
} from '@mantine/core';
import {
  Eye,
  Edit,
  Download,
  Trash2,
  MoreVertical
} from 'lucide-react';

interface PrisonerActionsProps {
  prisonerId: string;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDownload?: (id: string) => void;
  variant?: 'table' | 'card';
}

export const PrisonerActions = ({
  prisonerId,
  onView,
  onEdit,
  onDelete,
  onDownload,
  variant = 'table'
}: PrisonerActionsProps) => {
  if (variant === 'card') {
    return (
      <Stack gap="xs">
        <Button
          size="xs"
          variant="light"
          leftSection={<Eye size={14} />}
          onClick={() => onView(prisonerId)}
          fullWidth
        >
          Ver Expediente
        </Button>
        <Group gap="xs" grow>
          <Button
            size="xs"
            variant="outline"
            leftSection={<Edit size={14} />}
            onClick={() => onEdit(prisonerId)}
          >
            Editar
          </Button>
          <Menu shadow="md" width={150}>
            <Menu.Target>
              <ActionIcon variant="light" size="sm">
                <MoreVertical size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {onDownload && (
                <Menu.Item
                  leftSection={<Download size={14} />}
                  onClick={() => onDownload(prisonerId)}
                >
                  Descargar
                </Menu.Item>
              )}
              <Menu.Divider />
              <Menu.Item
                color="red"
                leftSection={<Trash2 size={14} />}
                onClick={() => onDelete(prisonerId)}
              >
                Eliminar
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Stack>
    );
  }

  // Versión para tabla (original)
  return (
    <Group gap="xs">
      <Button
        size="xs"
        variant="light"
        leftSection={<Eye size={14} />}
        onClick={() => onView(prisonerId)}
      >
        Ver Expediente
      </Button>
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <ActionIcon variant="light" size="sm">
            <MoreVertical size={16} />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            leftSection={<Edit size={14} />}
            onClick={() => onEdit(prisonerId)}
          >
            Editar
          </Menu.Item>
          {onDownload && (
            <Menu.Item
              leftSection={<Download size={14} />}
              onClick={() => onDownload(prisonerId)}
            >
              Descargar Expediente
            </Menu.Item>
          )}
          <Menu.Divider />
          <Menu.Item
            color="red"
            leftSection={<Trash2 size={14} />}
            onClick={() => onDelete(prisonerId)}
          >
            Eliminar
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
};