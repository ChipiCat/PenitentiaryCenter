import { useState, useEffect, useCallback } from 'react';
import {
    Modal,
    TextInput,
    Stack,
    Text,
    Group,
    Badge,
    Avatar,
    Loader,
    Box,
    ScrollArea,
    ActionIcon,
    Divider,
    UnstyledButton,
    CloseButton,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { Search, X, User, Calendar, FileText, MapPin } from 'lucide-react';
import { prisonersService } from '../services/prisonersService';
import type { PrisionerListItem } from '../types/prisonerTypes';

interface GlobalSearchProps {
    opened: boolean;
    onClose: () => void;
    onSelectResult?: (item: PrisionerListItem) => void;
}

export function GlobalSearch({ opened, onClose, onSelectResult }: GlobalSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery] = useDebouncedValue(searchQuery, 300);
    const [results, setResults] = useState<PrisionerListItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    // Cerrar con ESC
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && opened) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [opened]);

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

    const handleClose = () => {
        setSearchQuery('');
        setResults([]);
        setTotal(0);
        onClose();
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            Activo: 'green',
            Trasladado: 'blue',
            Liberado: 'gray',
            Archivado: 'red',
        };
        return colors[status] || 'gray';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
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
                blur: 8,
            }}
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
                                    <Box key={item.prisoner.id}>
                                        <UnstyledButton
                                            onClick={() => handleSelectResult(item)}
                                            style={{
                                                width: '100%',
                                                padding: 'var(--mantine-spacing-md)',
                                                transition: 'background-color 0.2s',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <Group wrap="nowrap" gap="md">
                                                <Avatar
                                                    src={item.identity?.photo_file?.url ?? ''}
                                                    size={48}
                                                    radius="md"
                                                >
                                                    {(!item.identity?.photo_file?.url || !item.identity?.photo_file?.url.trim()) ? (
                                                        <>
                                                            {item.identity?.first_name?.charAt(0) || ''}
                                                            {item.identity?.surname?.charAt(0) || ''}
                                                        </>
                                                    ) : (
                                                        <User size={24} />
                                                    )}
                                                </Avatar>

                                                <Box style={{ flex: 1, minWidth: 0 }}>
                                                    <Group gap="xs" mb={4}>
                                                        <Text fw={500} size="sm" lineClamp={1}>
                                                            {item.identity?.first_name} {item.identity?.surname}
                                                        </Text>
                                                        <Badge
                                                            size="xs"
                                                            color={getStatusColor(item.prisoner.status)}
                                                            variant="light"
                                                        >
                                                            {item.prisoner.status}
                                                        </Badge>
                                                    </Group>

                                                    <Stack gap={4}>
                                                        <Group gap="xs">
                                                            <FileText size={12} style={{ color: 'var(--mantine-color-dimmed)' }} />
                                                            <Text size="xs" c="dimmed">
                                                                Registro: {item.prisoner.registration_number}
                                                            </Text>
                                                        </Group>

                                                        <Group gap="xs">
                                                            <Calendar size={12} style={{ color: 'var(--mantine-color-dimmed)' }} />
                                                            <Text size="xs" c="dimmed">
                                                                Ingreso: {formatDate(item.prisoner.admission_date)}
                                                            </Text>
                                                        </Group>

                                                        {item.identity?.residence && (
                                                            <Group gap="xs">
                                                                <MapPin size={12} style={{ color: 'var(--mantine-color-dimmed)' }} />
                                                                <Text size="xs" c="dimmed" lineClamp={1}>
                                                                    {item.identity?.residence}
                                                                </Text>
                                                            </Group>
                                                        )}

                                                        {item.cases?.length > 0 && (
                                                            <Badge size="xs" variant="dot" color="orange">
                                                                {item.cases?.length} caso{item.cases?.length !== 1 ? 's' : ''}
                                                            </Badge>
                                                        )}
                                                    </Stack>
                                                </Box>
                                            </Group>
                                        </UnstyledButton>
                                        {index < results.length - 1 && <Divider />}
                                    </Box>
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
