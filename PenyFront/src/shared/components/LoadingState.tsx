import React from 'react';
import { Container, Stack, Text, LoadingOverlay } from '@mantine/core';
import { Loading } from './Loading';

interface LoadingStateProps {
  size?: 'sm' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  size = 'lg'
}) => {
  return (
    <Container size={size} pos="relative" style={{ minHeight: 400 }}>
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
        <Loading />
      </div>

    </Container>
  );
};