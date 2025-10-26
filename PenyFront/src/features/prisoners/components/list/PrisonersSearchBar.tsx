import React, { useState, useCallback } from 'react';
import { TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Search } from 'lucide-react';

interface PrisonersSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const PrisonersSearchBar: React.FC<PrisonersSearchBarProps> = ({
  onSearch,
  placeholder = 'Buscar por nombre, registro, expediente...',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery] = useDebouncedValue(searchQuery, 300);

  // Effect to trigger search when debounced query changes
  React.useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.currentTarget.value);
  }, []);

  return (
    <TextInput
      placeholder={placeholder}
      value={searchQuery}
      onChange={handleChange}
      leftSection={<Search size={16} />}
      size="sm"
      styles={{
        input: {
          '&:focus': {
            borderColor: 'var(--mantine-color-blue-6)',
          },
        },
      }}
    />
  );
};
