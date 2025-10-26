import React from 'react';
import { Card, Table, Group, Avatar, Text, Badge, ActionIcon, Tooltip } from '@mantine/core';
import { Eye, Edit } from 'lucide-react';
import type { PrisionerListItem, PrisonerBase } from '../../../../shared/types';

interface PrisonersListProps {
  prisoners: PrisionerListItem[];
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
              key={prisoner.prisoner.id}
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
  prisoner: PrisionerListItem;
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
          <Avatar size="sm" color="blue" src={prisoner.identity?.photo_file?.url || undefined}>
            {prisoner.identity?.first_name?.charAt(0) || "S"} {prisoner.identity?.surname?.charAt(0) || "N"}
          </Avatar>
          <div>
            <Text size="sm" fw={500}>
               {prisoner.identity?.first_name || "Sin nombre"} {prisoner.identity?.surname || ""}
            </Text>
            <Text size="xs" c="dimmed">
              ID: {prisoner.identity?.nationality || "Desconocida"}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td>
        <Text size="sm" ff="monospace">
          {prisoner.prisoner.registration_number}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm" ff="monospace">
          {prisoner.prisoner.fiscal_file_number || "N/A"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge
          color={
            prisoner.prisoner.status === "Activo"
              ? "blue"
              : prisoner.prisoner.status === "Trasladado"
              ? "orange"
              : prisoner.prisoner.status === "Liberado"
              ? "green"
              : "gray"
          }
          variant="light"
          size="sm"
        >
          {prisoner.prisoner.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {new Date(prisoner.prisoner.admission_date).toLocaleDateString()}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Tooltip label="Ver perfil">
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => onViewProfile(prisoner.prisoner)}
              color="blue"
            >
              <Eye size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Editar">
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => onEdit(prisoner.prisoner)}
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