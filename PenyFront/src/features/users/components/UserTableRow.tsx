import { Table, Group, Avatar, Text, Badge, ActionIcon } from '@mantine/core';
import { Edit, Trash2 } from 'lucide-react';
import type { User, UserActions } from '../../../shared/types/users/userTypes';
import { getUserInitials, getRoleColor, getStatusColor, getStatusLabel } from '../utils/userUtils';

interface UserTableRowProps {
  user: User;
  actions: UserActions;
}

export const UserTableRow = ({ user, actions }: UserTableRowProps) => {
  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="sm">
          <Avatar size="md" color={getRoleColor(user.role)}>
            {getUserInitials(user.name)}
          </Avatar>
          <div>
            <Text fw={500} size="sm">
              {user.name}
            </Text>
            <Text size="xs" c="dimmed">
              {user.username}
            </Text>
            <Text size="xs" c="dimmed">
              {user.email}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Badge color={getRoleColor(user.role)} variant="light">
          {user.role}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Badge color={getStatusColor(user.status)} variant="light">
          {getStatusLabel(user.status)}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{user.lastAccess}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{user.createdAt}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => actions.onEdit(user.id)}
          >
            <Edit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => actions.onDelete(user.id)}
          >
            <Trash2 size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};