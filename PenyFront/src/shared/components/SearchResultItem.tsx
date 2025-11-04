import { memo } from 'react';
import {
  Box,
  Stack,
  Text,
  Group,
  Badge,
  Avatar,
  Divider,
  UnstyledButton,
} from '@mantine/core';
import { FileText, Calendar, MapPin } from 'lucide-react';
import type { PrisionerListItem } from '../types/prisonerTypes';
import classes from '../styles/SearchResultItem.module.css';

interface SearchResultItemProps {
  item: PrisionerListItem;
  isLast: boolean;
  onSelect: (item: PrisionerListItem) => void;
}

const SearchResultItem = memo(
  ({ item, isLast, onSelect }: SearchResultItemProps) => {
    const getStatusColor = (status: string) => {
      const colors: Record<string, string> = {
        Activo: 'green',
        Trasladado: 'blue',
        Liberado: 'gray',
        Archivado: 'red',
      };
      return colors[status] || 'gray';
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    };

    return (
      <Box key={item.prisoner.id}>
        <UnstyledButton
          onClick={() => onSelect(item)}
          className={classes.resultItem}
        >
          <Group wrap="nowrap" gap="md">
            <div className="flex flex-row justify-between w-full">
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Group gap="xs" mb={4}>
                  <Text fw={500} size="sm" lineClamp={1}>
                    {item.identity?.first_name} {item.identity?.surname}
                  </Text>
                  <Badge
                    size="xs"
                    color={getStatusColor(item.prisoner.status)}
                    variant="light"
                  >
                    {item.prisoner.status}
                  </Badge>
                  <Badge size="xs" color="gray" variant="light">
                    {item.penitentiary?.category ?? 'Sin categoría'}
                  </Badge>
                </Group>
                <div className="flex flex-row justify-start w-full">
                  {/* Columna datos personales */}
                  <Stack gap={4}>
                    <Group gap="xs">
                      <FileText
                        size={12}
                        style={{ color: 'var(--mantine-color-dimmed)' }}
                      />
                      <Text size="xs" c="dimmed">
                        Registro: {item.prisoner.registration_number}
                      </Text>
                    </Group>

                    <Group gap="xs">
                      <Calendar
                        size={12}
                        style={{ color: 'var(--mantine-color-dimmed)' }}
                      />
                      <Text size="xs" c="dimmed">
                        Ingreso: {formatDate(item.prisoner.admission_date)}
                      </Text>
                    </Group>

                    {item.identity?.residence && (
                      <Group gap="xs">
                        <MapPin
                          size={12}
                          style={{ color: 'var(--mantine-color-dimmed)' }}
                        />
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          {item.identity?.residence}
                        </Text>
                      </Group>
                    )}
                    {item.cases?.length > 0 ? (
                      <Group gap={4} wrap="wrap">
                        <Badge size="xs" variant="dot" color="orange">
                          {item.cases?.length} caso
                          {item.cases?.length !== 1 ? 's' : ''}
                        </Badge>
                        {item.cases.map((c, idx) => (
                          <Badge
                            key={c.id || idx}
                            size="xs"
                            color="orange"
                            variant="light"
                          >
                            {c.crime}
                          </Badge>
                        ))}
                      </Group>
                    ) : (
                      <Text size="xs" c="dimmed">
                        Sin delitos
                      </Text>
                    )}
                  </Stack>
                  {/* Columna información penitenciaria */}
                  <Stack gap={4} style={{ minWidth: 120 }}>
                    {item.penitentiary?.building_number && (
                      <Text size="xs" c="dimmed">
                        Edificio: <b>{item.penitentiary.building_number}</b>
                      </Text>
                    )}
                    {item.penitentiary?.cell_number && (
                      <Text size="xs" c="dimmed">
                        Celda: <b>{item.penitentiary.cell_number}</b>
                      </Text>
                    )}
                    {item.penitentiary?.bed_number && (
                      <Text size="xs" c="dimmed">
                        Cama: <b>{item.penitentiary.bed_number}</b>
                      </Text>
                    )}
                    {!(
                      item.penitentiary?.category ||
                      item.penitentiary?.building_number ||
                      item.penitentiary?.cell_number ||
                      item.penitentiary?.bed_number
                    ) && <Text size="xs" c="dimmed">Sin datos</Text>}
                  </Stack>
                </div>
              </Box>
              <Avatar
                src={item.identity?.photo_file?.url ?? ''}
                size={86}
                radius="md"
              />
            </div>
          </Group>
        </UnstyledButton>
        {!isLast && <Divider />}
      </Box>
    );
  },
  (prevProps, nextProps) => {
    // Comparación personalizada para memo
    return (
      prevProps.item.prisoner.id === nextProps.item.prisoner.id &&
      prevProps.isLast === nextProps.isLast
    );
  }
);

SearchResultItem.displayName = 'SearchResultItem';

export { SearchResultItem };
