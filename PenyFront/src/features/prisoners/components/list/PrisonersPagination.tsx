import React from 'react';
import { Group, Pagination, Select, Text } from '@mantine/core';

interface PrisonersPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const PrisonersPagination: React.FC<PrisonersPaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}) => {
  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-200">
      <Group gap="sm">
        <Text size="sm" c="dimmed">
          Mostrando {startItem} - {endItem} de {total} registros
        </Text>
        <Select
          value={pageSize.toString()}
          onChange={(value) => onPageSizeChange(Number(value))}
          data={[
            { value: '12', label: '12 por página' },
            { value: '24', label: '24 por página' },
            { value: '50', label: '50 por página' },
            { value: '100', label: '100 por página' },
          ]}
          size="xs"
          w={140}
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
    </div>
  );
};
