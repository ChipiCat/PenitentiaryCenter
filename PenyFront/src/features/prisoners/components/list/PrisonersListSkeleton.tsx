import React from 'react';
import { Card, Skeleton, Stack, Group, Grid, Table } from '@mantine/core';

interface PrisonersListSkeletonProps {
  viewType?: 'table' | 'card';
  count?: number;
}

export const PrisonersListSkeleton: React.FC<PrisonersListSkeletonProps> = ({
  viewType = 'card',
  count = 10,
}) => {
  if (viewType === 'card') {
    return (
      <Card withBorder pos="relative">
        <Grid gutter="md">
          {Array.from({ length: count }).map((_, index) => (
            <Grid.Col
              span={{ base: 12, sm: 6, md: 4, lg: 3 }}
              key={index}
            >
              <Card withBorder shadow="xs" radius="lg" padding="md" style={{ minHeight: 370 }}>
                <Group gap="md" wrap="nowrap" align="flex-start">
                  <Skeleton height={64} circle />
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Skeleton height={20} width="80%" />
                    <Skeleton height={16} width="60%" mt={4} />
                    <Group gap={6} mt={8}>
                      <Skeleton height={24} width={80} radius="xl" />
                      <Skeleton height={24} width={60} radius="xl" />
                    </Group>
                  </Stack>
                </Group>
                
                <Stack gap={8} mt={16}>
                  <Skeleton height={14} width="90%" />
                  <Skeleton height={14} width="85%" />
                  <Skeleton height={14} width="70%" />
                </Stack>

                <Stack gap={8} mt={16}>
                  <Skeleton height={12} width="80%" />
                  <Skeleton height={12} width="75%" />
                  <Skeleton height={12} width="65%" />
                </Stack>

                <Group gap={4} mt={16}>
                  <Skeleton height={24} width={60} radius="xl" />
                  <Skeleton height={24} width={70} radius="xl" />
                  <Skeleton height={24} width={50} radius="xl" />
                </Group>

                <Group gap="xs" mt={16}>
                  <Skeleton height={32} style={{ flex: 1 }} radius="md" />
                </Group>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Card>
    );
  }

  // Table skeleton
  return (
    <Card withBorder pos="relative">
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
          {Array.from({ length: count }).map((_, index) => (
            <Table.Tr key={index}>
              <Table.Td>
                <Group gap="sm" wrap="nowrap">
                  <Skeleton height={60} width={60} radius="md" />
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Skeleton height={16} width="70%" />
                    <Skeleton height={14} width="50%" />
                    <Skeleton height={12} width="60%" />
                  </Stack>
                </Group>
              </Table.Td>
              <Table.Td>
                <Stack gap={6}>
                  <Skeleton height={12} width="80%" />
                  <Skeleton height={12} width="75%" />
                  <Skeleton height={12} width="70%" />
                </Stack>
              </Table.Td>
              <Table.Td>
                <Stack gap={6}>
                  <Skeleton height={12} width="70%" />
                  <Skeleton height={12} width="65%" />
                </Stack>
              </Table.Td>
              <Table.Td>
                <Stack gap={4}>
                  <Skeleton height={20} width={60} radius="xl" />
                  <Skeleton height={20} width={70} radius="xl" />
                </Stack>
              </Table.Td>
              <Table.Td>
                <Group gap="xs" wrap="nowrap">
                  <Skeleton height={36} width={36} circle />
                  <Skeleton height={36} width={36} circle />
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Card>
  );
};
