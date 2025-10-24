import React from 'react';
import { Card, Table, Group, Avatar, Text, Badge, ActionIcon, Tooltip } from '@mantine/core';
import { Eye, Edit } from 'lucide-react';
import type { PrisonerBase } from '../../../../shared/types';

interface PrisonersListProps {
  prisoners: (PrisonerBase & { fullName?: string })[];
  onViewProfile: (prisoner: PrisonerBase) => void;
  onEdit: (prisoner: PrisonerBase) => void;
}

export const PrisonersList: React.FC<PrisonersListProps> = ({
  prisoners,
  onViewProfile,
  onEdit,
}) => {
  return (
    <Card withBorder>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Prisionero</Table.Th>
            <Table.Th>Registro</Table.Th>
            <Table.Th>Expediente</Table.Th>
            <Table.Th>Estado</Table.Th>
            <Table.Th>Fecha Ingreso</Table.Th>
            <Table.Th>Acciones</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {prisoners.map((prisoner) => (
            <PrisonerRow
              key={prisoner.id}
              prisoner={prisoner}
              onViewProfile={onViewProfile}
              onEdit={onEdit}
            />
          ))}
        </Table.Tbody>
      </Table>
    </Card>
  );
};

interface PrisonerRowProps {
  prisoner: PrisonerBase & { fullName?: string };
  onViewProfile: (prisoner: PrisonerBase) => void;
  onEdit: (prisoner: PrisonerBase) => void;
}

const PrisonerRow: React.FC<PrisonerRowProps> = ({
  prisoner,
  onViewProfile,
  onEdit,
}) => {
  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="sm">
          <Avatar size="sm" color="blue">
            {prisoner.fullName?.charAt(0) || "?"}
          </Avatar>
          <div>
            <Text size="sm" fw={500}>
              {prisoner.fullName || "Sin nombre"}
            </Text>
            <Text size="xs" c="dimmed">
              ID: {prisoner.id}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm" ff="monospace">
          {prisoner.registration_number}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" ff="monospace">
          {prisoner.fiscal_file_number || "N/A"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge
          color={
            prisoner.status === "Activo"
              ? "blue"
              : prisoner.status === "Trasladado"
              ? "orange"
              : prisoner.status === "Liberado"
              ? "green"
              : "gray"
          }
          variant="light"
          size="sm"
        >
          {prisoner.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {new Date(prisoner.admission_date).toLocaleDateString()}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="Ver perfil">
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => onViewProfile(prisoner)}
              color="blue"
            >
              <Eye size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Editar">
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => onEdit(prisoner)}
              color="gray"
            >
              <Edit size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
};