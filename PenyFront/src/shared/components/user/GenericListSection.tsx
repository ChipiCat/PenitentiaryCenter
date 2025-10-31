// GenericListSection.tsx
import React from "react";
import { Group, ThemeIcon, Title, Stack, Text } from "@mantine/core";

type GenericListSectionProps<T> = {
  icon: React.ReactNode;
  title: string;
  button?: React.ReactNode;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyText: string;
  className?: string;
  order?: 4 | 3 | 2;
  gap?: number;
};

export const GenericListSection = <T,>({
  icon,
  title,
  button,
  items,
  renderItem,
  emptyText,
  className,
  order = 4,
  gap = 6,
}: GenericListSectionProps<T>) => (
  <>
    <Group justify="space-between" align="center" mb="xs">
      <Group gap={gap}>
        <ThemeIcon variant="transparent" color="#20263c">
          {icon}
        </ThemeIcon>
        <Title order={order}>{title}</Title>
      </Group>
      {button && <Group>{button}</Group>}
    </Group>
    <Stack gap="xs" className={className}>
      {items && items.length > 0 ? (
        items.map(renderItem)
      ) : (
        <Text c="dimmed" className={className}>
          {emptyText}
        </Text>
      )}
    </Stack>
  </>
);
