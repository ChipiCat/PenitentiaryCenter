import React, { useMemo, useCallback } from 'react';
import { Card, Group, Avatar, Text, Badge, Stack, Button } from '@mantine/core';
import { FileText, Calendar, Users, Eye } from 'lucide-react';
import type { PrisionerListItem, PrisonerBase } from '../../../../shared/types';

interface PrisonerCardProps {
  prisoner: PrisionerListItem;
  onViewProfile: (prisoner: PrisonerBase) => void;
  onEdit: (prisoner: PrisonerBase) => void;
}

// Utility functions outside component to avoid recreation
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

const PrisonerCard: React.FC<PrisonerCardProps> = ({ prisoner, onViewProfile }) => {
  const statusColor = useMemo(() => getStatusColor(prisoner.prisoner.status), [prisoner.prisoner.status]);
  const formattedDate = useMemo(() => formatDate(prisoner.prisoner.admission_date), [prisoner.prisoner.admission_date]);
  
  const handleViewProfile = useCallback(() => {
    onViewProfile(prisoner.prisoner);
  }, [onViewProfile, prisoner.prisoner]);

  return (
    <Card withBorder shadow="xs" radius="lg" padding="md" style={{ background: 'var(--mantine-color-body)', minHeight: 370 }}>
      <Group gap="md" wrap="nowrap" align="flex-start">
        <Avatar
          size={64}
          radius={80}
          src={prisoner.identity?.photo_file?.url || undefined}
        >
          {prisoner.identity?.first_name?.charAt(0) || "S"}
          {prisoner.identity?.surname?.charAt(0) || "N"}
        </Avatar>
        <Stack gap={4} style={{ minWidth: 0, flex: 1 }}>
          <Text size="md" fw={700} lineClamp={2}>
            {prisoner.identity?.first_name || "Sin nombre"} {prisoner.identity?.surname || ""}
          </Text>
          <Group gap={6} mt={2}>
            <Badge size="sm" color={statusColor} variant="filled">
              {prisoner.prisoner.status}
            </Badge>
            {prisoner.penitentiary?.category && (
              <Badge size="sm" color="gray" variant="light">
                {prisoner.penitentiary.category}
              </Badge>
            )}
          </Group>
        </Stack>
      </Group>
      <Stack gap={4} mt={12}>
        <Group gap="xs" mt={2}>
          <FileText size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />
          <Text size="sm" c="dimmed" lineClamp={1}>
            Reg: {prisoner.prisoner.registration_number}
          </Text>
        </Group>
        {prisoner.prisoner.fiscal_file_number && (
          <Group gap="xs" mt={2}>
            <FileText size={16} style={{ color: 'var(--mantine-color-dimmed)' }} />
            <Text size="sm" c="dimmed" lineClamp={1}>
              Exp: {prisoner.prisoner.fiscal_file_number}
            </Text>
          </Group>
        )}
      </Stack>
      <Stack gap={8} mt={12} style={{ borderTop: '1px solid #eee', paddingTop: 10 }}>
        <Group gap="xs" wrap="nowrap">
          <Calendar size={16} style={{ color: 'var(--mantine-color-blue-6)', flexShrink: 0 }} />
          <Text size="sm" c="dimmed" lineClamp={1}>
            Ingreso: {formattedDate}
          </Text>
        </Group>
        {prisoner.identity?.nationality && (
          <Group gap="xs" wrap="nowrap">
            <Users size={16} style={{ color: 'var(--mantine-color-blue-6)', flexShrink: 0 }} />
            <Text size="sm" lineClamp={1}>
              {prisoner.identity.nationality}
            </Text>
          </Group>
        )}

        {prisoner.penitentiary && (
          <Group gap="xs" wrap="nowrap">
            {prisoner.penitentiary.building_number && (
              <Text size="sm" c="dimmed">Edificio: {prisoner.penitentiary.building_number}</Text>
            )}
            {prisoner.penitentiary.cell_number && (
              <Text size="sm" c="dimmed">Celda: {prisoner.penitentiary.cell_number}</Text>
            )}
            {prisoner.penitentiary.bed_number && (
              <Text size="sm" c="dimmed">Cama: {prisoner.penitentiary.bed_number}</Text>
            )}
          </Group>
        )}
        {prisoner.cases && prisoner.cases.length > 0 ? (
          <Group gap={4}>
            {prisoner.cases.slice(0, 3).map((c: { id?: string; crime: string }, idx: number) => (
              <Badge key={c.id || idx} size="sm" color="red" variant="light">
                {c.crime}
              </Badge>
            ))}
            {prisoner.cases.length > 3 && (
              <Badge size="sm" color="gray" variant="light">
                +{prisoner.cases.length - 3} más
              </Badge>
            )}
          </Group>
        ) : (
          <Text size="sm" c="dimmed" fs="italic">
            Sin casos registrados
          </Text>
        )}
      </Stack>
      <Group gap="xs" style={{ marginTop: 'auto' }}>
        <Button
          size="xs"
          variant="light"
          color="blue"
          onClick={handleViewProfile}
          leftSection={<Eye size={16} />}
          flex={1}
        >
          Ver Perfil
        </Button>
      </Group>
    </Card>
  );
};

export default React.memo(PrisonerCard);