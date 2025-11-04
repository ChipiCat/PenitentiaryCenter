import { useState, useEffect, useCallback } from 'react';
import {
    Modal,
    TextInput,
    Stack,
    Text,
    Group,
    Badge,
    Loader,
    Box,
    ScrollArea,
    ActionIcon,
    CloseButton,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Search, X } from 'lucide-react';
import { prisonersService } from '../services/prisonersService';
import { SearchResultItem } from './SearchResultItem';
import type { PrisionerListItem } from '../types/prisonerTypes';

interface GlobalSearchProps {
    opened: boolean;
    onClose: () => void;
    onSelectResult?: (item: PrisionerListItem) => void;
}

export function GlobalSearch({ opened, onClose, onSelectResult }: GlobalSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery] = useDebouncedValue(searchQuery, 150);
    const [results, setResults] = useState<PrisionerListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const handleClose = useCallback(() => {
        setSearchQuery('');
        setResults([]);
        setTotal(0);
        onClose();
    }, [onClose]);

    

    // Cerrar con ESC
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && opened) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [opened, handleClose]);

    const searchPrisoners = useCallback(async (query: string) => {
        if (!query.trim()) {
            setResults([]);
            setTotal(0);
            return;
        }

        setLoading(true);
        try {
            const response = await prisonersService.getAllPrisoners(
                1,
                10,
                query,
                undefined,
                false,
                'admissionDate',
                'desc'
            );
            setResults(response.data);
            setTotal(response.pagination.total);
        } catch (error) {
            console.error('Error searching prisoners:', error);
            setResults([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        searchPrisoners(debouncedQuery);
    }, [debouncedQuery, searchPrisoners]);

    const handleSelectResult = (item: PrisionerListItem) => {
        onSelectResult?.(item);
        handleClose();
    };

    return (
        <Modal
            yOffset="10vh"
            opened={opened}
            onClose={handleClose}
            size="lg"
            padding={0}
            withCloseButton={false}
            overlayProps={{
                opacity: 0.55,
            }}
            transitionProps={{ transition: 'fade', duration: 150 }}
            styles={{
                body: { padding: 0 },
                content: { overflow: 'hidden' },
            }}
        >
            <Box>
                <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}>
                    <Group gap="xs" mb="xs" justify="space-between">
                        <Group gap="xs">
                            <Text size="xs" c="dimmed" fw={500}>
                                Búsqueda Global
                            </Text>
                            <Badge size="xs" variant="light" color="gray">
                                Ctrl+K
                            </Badge>
                        </Group>
                        <CloseButton onClick={handleClose} size="sm" />
                    </Group>
                    <TextInput
                        data-autofocus
                        placeholder="Buscar reclusos por nombre, número de registro..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        leftSection={<Search size={16} />}
                        rightSection={
                            searchQuery ? (
                                <ActionIcon
                                    variant="subtle"
                                    color="gray"
                                    onClick={() => setSearchQuery('')}
                                    size="sm"
                                >
                                    <X size={14} />
                                </ActionIcon>
                            ) : null
                        }
                        styles={{
                            input: {
                                border: 'none',
                                backgroundColor: 'var(--mantine-color-gray-0)',
                            },
                        }}
                    />
                </Box>

                <ScrollArea h={400} type="auto">
                    {loading ? (
                        <Box p="xl" style={{ textAlign: 'center' }}>
                            <Loader size="md" />
                            <Text size="sm" c="dimmed" mt="md">
                                Buscando...
                            </Text>
                        </Box>
                    ) : results.length > 0 ? (
                        <>
                            <Box p="xs" px="md" style={{ backgroundColor: 'var(--mantine-color-gray-0)' }}>
                                <Text size="xs" c="dimmed" fw={500}>
                                    {total} resultado{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
                                </Text>
                            </Box>
                            <Stack gap={0}>
                                {results.map((item, index) => (
                                    <SearchResultItem
                                        key={item.prisoner.id}
                                        item={item}
                                        isLast={index === results.length - 1}
                                        onSelect={handleSelectResult}
                                    />
                                ))}
                            </Stack>
                        </>
                    ) : searchQuery.trim() ? (
                        <Box p="xl" style={{ textAlign: 'center' }}>
                            <Text size="sm" c="dimmed">
                                No se encontraron resultados
                            </Text>
                            <Text size="xs" c="dimmed" mt="xs">
                                Intenta con otro término de búsqueda
                            </Text>
                        </Box>
                    ) : (
                        <Box p="xl" style={{ textAlign: 'center' }}>
                            <Search size={32} style={{ color: 'var(--mantine-color-dimmed)', margin: '0 auto' }} />
                            <Text size="sm" c="dimmed" mt="md">
                                Escribe para buscar reclusos
                            </Text>
                            <Text size="xs" c="dimmed" mt="xs">
                                Busca por nombre, apellido o número de registro
                            </Text>
                        </Box>
                    )}
                </ScrollArea>

                {results.length > 0 && (
                    <Box
                        p="xs"
                        px="md"
                        style={{
                            borderTop: '1px solid var(--mantine-color-gray-3)',
                            backgroundColor: 'var(--mantine-color-gray-0)',
                        }}
                    >
                        <Text size="xs" c="dimmed" ta="center">
                            Presiona <kbd>ESC</kbd> para cerrar
                        </Text>
                    </Box>
                )}
            </Box>
        </Modal>
    );
}
