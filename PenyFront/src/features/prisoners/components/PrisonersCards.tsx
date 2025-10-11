import {
  Paper,
  Text,
  Badge,
  Grid,
  Stack,
  Group,
  Flex,
  Pagination
} from '@mantine/core';
import { getStatusColor } from '../utils/prisonerUtils';
import { PrisonerActions } from './PrisonerActions';
import type { PrisonersCardsProps } from '../types';

export const PrisonersCards = ({
  prisoners,
  totalPages,
  activePage,
  onPageChange,
  onViewPrisoner,
  onEditPrisoner,
  onDeletePrisoner,
  onDownloadPrisoner
}: PrisonersCardsProps) => {
  return (
    <Stack gap="md">
      <Grid>
        {prisoners.map((prisoner) => (
          <Grid.Col key={prisoner.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <Paper p="md" withBorder radius="md" h="100%">
              <Stack gap="sm" h="100%">
                {/* Header de la card */}
                <Group justify="space-between" align="flex-start">
                  <div style={{ flex: 1 }}>
                    <Text fw={600} size="sm" lineClamp={2}>
                      {prisoner.fullName}
                    </Text>
                    <Text size="xs" c="dimmed" mt="xs">
                      Cédula: {prisoner.idNumber}
                    </Text>
                  </div>
                  <Badge
                    color={getStatusColor(prisoner.status)}
                    variant="light"
                    radius="sm"
                    size="sm"
                  >
                    {prisoner.status}
                  </Badge>
                </Group>

                {/* Información adicional */}
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Group gap="xs">
                    <Text size="xs" c="dimmed">Creado:</Text>
                    <Text size="xs">{prisoner.createdAt}</Text>
                  </Group>
                  <Group gap="xs">
                    <Text size="xs" c="dimmed">Actualizado:</Text>
                    <Text size="xs">{prisoner.updatedAt}</Text>
                  </Group>
                </Stack>

                {/* Acciones */}
                <div style={{ marginTop: 'auto' }}>
                  <PrisonerActions
                    prisonerId={prisoner.id}
                    onView={onViewPrisoner}
                    onEdit={onEditPrisoner}
                    onDelete={onDeletePrisoner}
                    onDownload={onDownloadPrisoner}
                  />
                </div>
              </Stack>
            </Paper>
          </Grid.Col>
        ))}
      </Grid>

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
    </Stack>
  );
};