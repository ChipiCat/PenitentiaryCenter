import React from 'react';
import { Group, Pagination, Select, Text, Stack } from '@mantine/core';

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}) => {
  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  return (
    <Stack gap="md" mt="md">
      <Group justify="space-between" align="center" wrap="wrap">
        <Group gap="sm">
          <Text size="sm" c="dimmed">
            Mostrando {startItem} - {endItem} de {total} registros
          </Text>
          <Select
            value={pageSize.toString()}
            onChange={(value) => onPageSizeChange(Number(value) || 10)}
            data={pageSizeOptions.map((size) => ({
              value: size.toString(),
              label: `${size} por página`,
            }))}
            size="xs"
            w={140}
            aria-label="Registros por página"
          />
        </Group>

        {totalPages > 1 && (
          <Pagination
            total={totalPages}
            value={currentPage}
            onChange={onPageChange}
            size="sm"
            withEdges
          />
        )}
      </Group>
    </Stack>
  );
};