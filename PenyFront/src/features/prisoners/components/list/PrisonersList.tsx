import React, { useMemo, useCallback } from 'react';
import { Card, Table, Group, Avatar, Text, Badge, ActionIcon, Tooltip, Stack, Grid } from '@mantine/core';
import { Eye, Edit, Calendar, FileText, MapPin, Building2, Bed, Users } from 'lucide-react';
import type { PrisionerListItem, PrisonerBase } from '../../../../shared/types';
import PrisonerCard from './PrisonerCard';
import { PrisonersListSkeleton } from './PrisonersListSkeleton';
import { useGlobalContext } from '../../../../shared/hooks/useGlobalContext';

interface PrisonersListProps {
  prisoners: PrisionerListItem[];
  onViewProfile: (prisoner: PrisonerBase) => void;
  onEdit: (prisoner: PrisonerBase) => void;
  loading?: boolean;
  viewType?: 'table' | 'card';
}

// Utility functions outside component
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    Activo: 'green',
    Trasladado: 'blue',
    Liberado: 'gray',
    Archivado: 'red',
  };
  return colors[status] || 'gray';
};

export const PrisonersList: React.FC<PrisonersListProps> = React.memo(({
  prisoners,
  onViewProfile,
  onEdit,
  loading = false,
  viewType = 'table',
}) => {
  if (loading) {
    return <PrisonersListSkeleton viewType={viewType} count={12} />;
  }

  return (
    <Card withBorder pos="relative">
      {viewType === 'card' ? (
        <Grid gutter="md">
          {prisoners?.map((prisoner) => (
            <Grid.Col
              span={{ base: 12, sm: 6, md: 4, lg: 3 }}
              key={prisoner.prisoner.id}
            >
              <PrisonerCard
                prisoner={prisoner}
                onViewProfile={onViewProfile}
                onEdit={onEdit}
              />
            </Grid.Col>
          ))}
        </Grid>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Prisionero</Table.Th>
              <Table.Th>Información Personal</Table.Th>
              <Table.Th>Ubicación Penitenciaria</Table.Th>
              <Table.Th>Casos y Delitos</Table.Th>
              <Table.Th>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {prisoners?.map((prisoner) => (
              <PrisonerRow
                key={prisoner.prisoner.id}
                prisoner={prisoner}
                onViewProfile={onViewProfile}
                onEdit={onEdit}
              />
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Card>
  );
});

interface PrisonerRowProps {
  prisoner: PrisionerListItem;
  onViewProfile: (prisoner: PrisonerBase) => void;
  onEdit: (prisoner: PrisonerBase) => void;
}

const PrisonerRow: React.FC<PrisonerRowProps> = React.memo(({
  prisoner,
  onViewProfile,
  onEdit,
}) => {
  const statusColor = useMemo(() => getStatusColor(prisoner.prisoner.status), [prisoner.prisoner.status]);
  const formattedDate = useMemo(() => formatDate(prisoner.prisoner.admission_date), [prisoner.prisoner.admission_date]);
  
  const handleViewProfile = useCallback(() => {
    onViewProfile(prisoner.prisoner);
  }, [onViewProfile, prisoner.prisoner]);
  
  const handleEdit = useCallback(() => {
    onEdit(prisoner.prisoner);
  }, [onEdit, prisoner.prisoner]);

  const { user } = useGlobalContext();

  return (
    <Table.Tr>
      {/* Columna: Prisionero */}
      <Table.Td>
        <Group gap="sm" wrap="nowrap">
          <Avatar
            size={60}
            radius="md"
            src={prisoner.identity?.photo_file?.url || undefined}
          >
            {prisoner.identity?.first_name?.charAt(0) || "S"}
            {prisoner.identity?.surname?.charAt(0) || "N"}
          </Avatar>
          <div style={{ minWidth: 0 }}>
            <Text size="sm" fw={600} lineClamp={1}>
              {prisoner.identity?.first_name || "Sin nombre"}{" "}
              {prisoner.identity?.surname || ""}
            </Text>
            <Group gap={4} mt={4}>
              <Badge
                size="xs"
                color={statusColor}
                variant="light"
              >
                {prisoner.prisoner.status}
              </Badge>
              {prisoner.penitentiary?.category && (
                <Badge size="xs" color="gray" variant="light">
                  {prisoner.penitentiary.category}
                </Badge>
              )}
            </Group>
            <Group gap="xs" mt={4}>
              <FileText size={12} style={{ color: 'var(--mantine-color-dimmed)' }} />
              <Text size="xs" c="dimmed" lineClamp={1}>
                Reg: {prisoner.prisoner.registration_number}
              </Text>
            </Group>
            {prisoner.prisoner.fiscal_file_number && (
              <Group gap="xs" mt={2}>
                <FileText size={12} style={{ color: 'var(--mantine-color-dimmed)' }} />
                <Text size="xs" c="dimmed" lineClamp={1}>
                  Exp: {prisoner.prisoner.fiscal_file_number}
                </Text>
              </Group>
            )}
          </div>
        </Group>
      </Table.Td>

      {/* Columna: Información Personal */}
      <Table.Td>
        <div className='flex flex-row gap-2 items-start'>
          <Stack gap={6}>
            <Group gap="xs" wrap="nowrap">
              <Calendar size={14} style={{ color: 'var(--mantine-color-blue-6)', flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <Text size="xs" c="dimmed" lineClamp={1}>
                  Ingreso
                </Text>
                <Text size="xs" fw={500} lineClamp={1}>
                  {formattedDate}
                </Text>
              </div>
            </Group>

            {prisoner.identity?.nationality && (
              <Group gap="xs" wrap="nowrap">
                <Users size={14} style={{ color: 'var(--mantine-color-blue-6)', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    Nacionalidad
                  </Text>
                  <Text size="xs" lineClamp={1}>
                    {prisoner.identity.nationality}
                  </Text>
                </div>
              </Group>
            )}

          </Stack>

          {prisoner.identity?.residence && (
            <Group gap="xs" wrap="nowrap">
              <MapPin size={14} style={{ color: 'var(--mantine-color-blue-6)', flexShrink: 0 }} />
              <div style={{ minWidth: 0 }}>
                <Text size="xs" c="dimmed" lineClamp={1}>
                  Residencia
                </Text>
                <Text size="xs" lineClamp={1}>
                  {prisoner.identity.residence}
                </Text>
              </div>
            </Group>
          )}
        </div>
      </Table.Td>

      {/* Columna: Ubicación Penitenciaria */}
      <Table.Td>
        {prisoner.penitentiary ? (
          <div className='flex flex-row gap-2 justify-start items-start'>
            <Stack gap={6}>
              {prisoner.penitentiary.building_number && (
                <Group gap="xs" wrap="nowrap">
                  <Building2 size={14} style={{ color: 'var(--mantine-color-orange-6)', flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <Text size="xs" c="dimmed">
                      Edificio
                    </Text>
                    <Text size="xs" fw={500}>
                      {prisoner.penitentiary.building_number}
                    </Text>
                  </div>
                </Group>
              )}

              {prisoner.penitentiary.cell_number && (
                <Group gap="xs" wrap="nowrap">
                  <Building2 size={14} style={{ color: 'var(--mantine-color-orange-6)', flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <Text size="xs" c="dimmed">
                      Celda
                    </Text>
                    <Text size="xs" fw={500}>
                      {prisoner.penitentiary.cell_number}
                    </Text>
                  </div>
                </Group>
              )}

              {!prisoner.penitentiary.building_number &&
                !prisoner.penitentiary.cell_number &&
                !prisoner.penitentiary.bed_number && (
                  <Text size="xs" c="dimmed" fs="italic">
                    Sin ubicación asignada
                  </Text>
                )}
            </Stack>
            {prisoner.penitentiary.bed_number && (
              <Group gap="xs" wrap="nowrap">
                <Bed size={14} style={{ color: 'var(--mantine-color-orange-6)', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <Text size="xs" c="dimmed">
                    Cama
                  </Text>
                  <Text size="xs" fw={500}>
                    {prisoner.penitentiary.bed_number}
                  </Text>
                </div>
              </Group>
            )}
          </div>
        ) : (
          <Text size="xs" c="dimmed" fs="italic">
            Sin datos penitenciarios
          </Text>
        )}
      </Table.Td>

      {/* Columna: Casos y Delitos */}
      <Table.Td>
        {prisoner.cases && prisoner.cases.length > 0 ? (
          <Stack gap={6}>
            {prisoner.cases.slice(0, 3).map((c, idx) => (
              <Badge
                key={c.id || idx}
                size="xs"
                color="red"
                variant="light"
              >
                {c.crime}
              </Badge>
            ))}
            {prisoner.cases.length > 3 && (
              <Badge size="xs" color="gray" variant="light">
                +{prisoner.cases.length - 3} más
              </Badge>
            )}
          </Stack>
        ) : (
          <Text size="xs" c="dimmed" fs="italic">
            Sin casos registrados
          </Text>
        )}
      </Table.Td>

      {/* Columna: Acciones */}
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <Tooltip label="Ver perfil completo">
            <ActionIcon
              variant="light"
              size="md"
              onClick={handleViewProfile}
              color="blue"
            >
              <Eye size={18} />
            </ActionIcon>
          </Tooltip>
        { (user?.role === 'ADMIN' || user?.role === 'SECRETARY' ) && (
          <Tooltip label="Editar prisionero">
            <ActionIcon
              variant="light"
              size="md"
              onClick={handleEdit}
              color="gray"
            >
              <Edit size={18} />
            </ActionIcon>

          </Tooltip>
        )}
        </Group>
      </Table.Td>
    </Table.Tr>
  );
});
