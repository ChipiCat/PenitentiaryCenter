import React, { useState, useCallback, useEffect, memo } from 'react';
import { TextInput, ActionIcon } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Search, X } from 'lucide-react';

interface PrisonersSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const PrisonersSearchBar: React.FC<PrisonersSearchBarProps> = memo(({
  onSearch,
  placeholder = 'Buscar por nombre, registro, expediente...',
}) => {
  // Local state for immediate UI updates (keeps input responsive)
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debounced value to reduce parent notifications
  const [debouncedQuery] = useDebouncedValue(searchQuery, 400);

  // Only notify parent when debounced value changes
  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  // Immediate local state update - no parent notification
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.currentTarget.value);
  }, []);

  // Clear handler
  const handleClear = useCallback(() => {
    setSearchQuery('');
  }, []);

  return (
    <TextInput
      placeholder={placeholder}
      value={searchQuery}
      onChange={(event) => handleChange(event)}
      leftSection={<Search size={16} />}
      rightSection={
        searchQuery ? (
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={handleClear}
            size="sm"
            aria-label="Limpiar búsqueda"
          >
            <X size={14} />
          </ActionIcon>
        ) : null
      }
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
});

// Display name for debugging
PrisonersSearchBar.displayName = 'PrisonersSearchBar';

export default PrisonersSearchBar;