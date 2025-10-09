import {
  Paper,
  Table,
  Text,
  Badge,
  Flex,
  Pagination
} from '@mantine/core';
import type { Prisoner } from '../utils/types';
import { getStatusColor } from '../utils/prisonerUtils';
import { PrisonerActions } from './PrisonerActions';

interface PrisonersTableProps {
  prisoners: Prisoner[];
  totalPages: number;
  activePage: number;
  onPageChange: (page: number) => void;
  onViewPrisoner: (id: string) => void;
  onEditPrisoner: (id: string) => void;
  onDeletePrisoner: (id: string) => void;
  onDownloadPrisoner?: (id: string) => void;
}

export const PrisonersTable = ({
  prisoners,
  totalPages,
  activePage,
  onPageChange,
  onViewPrisoner,
  onEditPrisoner,
  onDeletePrisoner,
  onDownloadPrisoner
}: PrisonersTableProps) => {
  return (
    <Paper withBorder>
      <Table.ScrollContainer minWidth={800}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nombre Completo</Table.Th>
              <Table.Th>Cédula de Identidad</Table.Th>
              <Table.Th>Estado</Table.Th>
              <Table.Th>Fecha Creación</Table.Th>
              <Table.Th>Última Actualización</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {prisoners.map((prisoner) => (
              <Table.Tr key={prisoner.id}>
                <Table.Td>
                  <Text fw={500}>{prisoner.fullName}</Text>
                </Table.Td>
                <Table.Td>
                  <Text c="dimmed">{prisoner.idNumber}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={getStatusColor(prisoner.status)}
                    variant="light"
                    radius="sm"
                  >
                    {prisoner.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{prisoner.createdAt}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{prisoner.updatedAt}</Text>
                </Table.Td>
                <Table.Td>
                  <PrisonerActions
                    prisonerId={prisoner.id}
                    onView={onViewPrisoner}
                    onEdit={onEditPrisoner}
                    onDelete={onDeletePrisoner}
                    onDownload={onDownloadPrisoner}
                    variant="table"
                  />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {/* Paginación */}
      {totalPages > 1 && (
        <Flex justify="center" p="md">
          <Pagination
            total={totalPages}
            value={activePage}
            onChange={onPageChange}
            size="sm"
          />
        </Flex>
      )}
    </Paper>
  );
};