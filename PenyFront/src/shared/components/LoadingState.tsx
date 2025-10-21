import React from 'react';
import { Container, Stack, Text, LoadingOverlay } from '@mantine/core';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Cargando...', 
  size = 'lg' 
}) => {
  return (
    <Container size={size} pos="relative" style={{ minHeight: 400 }}>
      <LoadingOverlay visible overlayProps={{ blur: 2 }} />
      <Stack align="center" justify="center" style={{ minHeight: 400 }}>
        <Text>{message}</Text>
      </Stack>
    </Container>
  );
};