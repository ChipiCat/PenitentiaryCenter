import { Title, Text } from '@mantine/core';

export const PrisonersHeader = () => {
  return (
    <div>
      <Title order={2}>Gestión de Reclusos</Title>
      <Text c="dimmed">Lista completa de internos del centro penitenciario</Text>
    </div>
  );
};