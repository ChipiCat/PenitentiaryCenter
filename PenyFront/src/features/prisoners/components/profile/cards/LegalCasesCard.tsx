import React from 'react';
import {
  Card,
  Group,
  Title,
  ThemeIcon,
  Stack,
  Text,
  Badge,
  Divider,
  Button,
  Accordion,
  Box,
  ActionIcon,
  Tooltip,
  Alert,
} from '@mantine/core';
import { Gavel, Plus, Edit3, Trash2 } from 'lucide-react';
import type { Case, CreateCaseData, CreateMandatesData, Mandate, UpdateCaseData } from '../../../../../shared/types/caseTypes';
import type { FileInfo } from '../../../../../shared/types/filesTypes';
import { useCaseEditor } from '../hooks/useCaseEditor';
import { useMandateEditor } from '../hooks/useMandateEditor';
import { CaseForm } from '../forms/CaseForm';
import { MandateForm } from '../forms/MandateForm';
import FileView from '../../../../../shared/components/FileView';
import { useGlobalContext } from '../../../../../shared/hooks/useGlobalContext';

interface LegalCasesCardProps {
  cases: Case[];
  prisonerId: string;
  onRefresh?: () => void;
}

export const LegalCasesCard: React.FC<LegalCasesCardProps> = ({ 
  cases,
  prisonerId,
  onRefresh 
}) => {
  const {
    isCreating: isCreatingCase,
    editingCaseId,
    isLoading: isLoadingCase,
    errors: caseErrors,
    startCreating: startCreatingCase,
    startEditing: startEditingCase,
    cancelEditing: cancelEditingCase,
    createCase,
    updateCase,
    deleteCase,
  } = useCaseEditor({ prisonerId, onSuccess: onRefresh });

  // Estado para controlar qué caso tiene el formulario de mandato abierto
  const [activeCaseForMandate, setActiveCaseForMandate] = React.useState<string | null>(null);

  const {
    isCreating: isCreatingMandate,
    editingMandateId,
    isLoading: isLoadingMandate,
    errors: mandateErrors,
    startCreating: startCreatingMandate,
    startEditing: startEditingMandate,
    cancelEditing: cancelEditingMandate,
    createMandate,
    updateMandate,
    deleteMandate,
    uploadMandateFile,
  } = useMandateEditor({ 
    caseId: activeCaseForMandate || '', 
    onSuccess: () => {
      onRefresh?.();
      setActiveCaseForMandate(null);
    }
  });

  // Convertir FileInfo desde Mandate.file
  const getMandateFileInfo = (mandate: Mandate): FileInfo | null => {
    if (!mandate.file || !mandate.file.url) return null;
    return mandate.file;
  };

  // Función para iniciar creación de mandato
  const handleStartCreatingMandate = (caseId: string) => {
    setActiveCaseForMandate(caseId);
    startCreatingMandate();
  };

  // Función para iniciar edición de mandato
  const handleStartEditingMandate = (caseId: string, mandateId: string) => {
    setActiveCaseForMandate(caseId);
    startEditingMandate(mandateId);
  };

  // Función para cancelar edición de mandato
  const handleCancelEditingMandate = () => {
    cancelEditingMandate();
    setActiveCaseForMandate(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EnProceso':
        return 'blue';
      case 'Condenado':
        return 'red';
      case 'Apelacion':
        return 'yellow';
      case 'Cerrado':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getMandateStatusColor = (status: string) => {
    switch (status) {
      case 'Vigente':
        return 'green';
      case 'Ejecutado':
        return 'blue';
      case 'Anulado':
        return 'red';
      default:
        return 'gray';
    }
  };

  const {user} = useGlobalContext();

  return (
    <Card withBorder padding="lg" h="100%">
      <Group justify="space-between" mb="md">
        <Group gap={6}>
          <ThemeIcon variant="transparent" color="#20263c">
            <Gavel size={20} />
          </ThemeIcon>
          <Title order={3} size="h4">
            Casos Judiciales
          </Title>
        </Group>

        {!isCreatingCase && !editingCaseId && (user?.role === 'ADMIN' || user?.role === 'SECRETARY') && (
          <Button
            leftSection={<Plus size={16} />}
            size="xs"
            onClick={startCreatingCase}
          >
            Nuevo Caso
          </Button>
        )}

      </Group>
      
      <Divider mb="md" />

      {/* Formulario de creación de caso */}
      {isCreatingCase && (
        <Box mb="md" p="md" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <Title order={5} mb="md">Crear Nuevo Caso Judicial</Title>
          <CaseForm
            mode="create"
            onSubmit={async (data) => {
              await createCase(data as CreateCaseData);
            }}
            onCancel={cancelEditingCase}
            isLoading={isLoadingCase}
            errors={caseErrors}
          />
        </Box>
      )}

      {/* Lista de casos con mandatos anidados */}
      {cases && cases.length > 0 ? (
        <Accordion variant="separated">
          {cases.map((caseItem) => (
            <Accordion.Item key={caseItem.id} value={caseItem.id}>
              <Accordion.Control>
                <Group justify="space-between">
                  <div>
                    <Group gap="xs">
                      <Text fw={600}>{caseItem.case_number}</Text>
                      <Badge color={getStatusColor(caseItem.status)}>
                        {caseItem.status === 'EnProceso' ? 'En Proceso' : caseItem.status}
                      </Badge>
                    </Group>
                    <Text size="sm" c="dimmed">
                      {caseItem.crime}
                    </Text>
                  </div>
                </Group>
              </Accordion.Control>
              
              <Accordion.Panel>
                {editingCaseId === caseItem.id ? (
                  <Box p="md" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <Title order={5} mb="md">Editar Caso Judicial</Title>
                    <CaseForm
                      mode="edit"
                      initialData={caseItem}
                      onSubmit={async (data) => {
                        await updateCase(caseItem.id, data as UpdateCaseData);
                      }}
                      onCancel={cancelEditingCase}
                      isLoading={isLoadingCase}
                      errors={caseErrors}
                    />
                  </Box>
                ) : (
                  <Stack gap="md">
                    {/* Información del caso */}
                    <Box>
                      <Text size="sm" c="dimmed">Juzgado</Text>
                      <Text fw={500}>{caseItem.court_name}</Text>
                    </Box>

                    <Box>
                      <Text size="sm" c="dimmed">Juez</Text>
                      <Text fw={500}>{caseItem.judge_name}</Text>
                    </Box>

                    <Group grow>
                      <Box>
                        <Text size="sm" c="dimmed">Años de Sentencia</Text>
                        <Text fw={500}>{caseItem.sentence_years}</Text>
                      </Box>
                      <Box>
                        <Text size="sm" c="dimmed">Fecha de Inicio</Text>
                        <Text fw={500}>
                          {new Date(caseItem.start_date).toLocaleDateString('es-ES')}
                        </Text>
                      </Box>
                    </Group>

                    {caseItem.end_date && (
                      <Box>
                        <Text size="sm" c="dimmed">Fecha de Fin</Text>
                        <Text fw={500}>
                          {new Date(caseItem.end_date).toLocaleDateString('es-ES')}
                        </Text>
                      </Box>
                    )}

                    {caseItem.remarks && (
                      <Box>
                        <Text size="sm" c="dimmed">Observaciones</Text>
                        <Text>{caseItem.remarks}</Text>
                      </Box>
                    )}

                    <Divider my="md" />

                    {/* Acciones del caso */}
                    <Group justify="space-between">
                      <Title order={5} size="h6">Mandatos Judiciales</Title>
                      {(user?.role === 'ADMIN' || user?.role === 'SECRETARY') && (
                      <Group>
                        <Button
                          leftSection={<Plus size={14} />}
                          size="xs"
                          variant="light"
                          onClick={() => handleStartCreatingMandate(caseItem.id)}
                          disabled={isCreatingMandate && activeCaseForMandate === caseItem.id}
                        >
                          Agregar Mandato
                        </Button>
                        <Tooltip label="Editar caso">
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            onClick={() => startEditingCase(caseItem.id)}
                          >
                            <Edit3 size={16} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Eliminar caso">
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            onClick={() => {
                              if (window.confirm('¿Estás seguro de eliminar este caso? Se eliminarán todos los mandatos asociados.')) {
                                deleteCase(caseItem.id);
                              }
                            }}
                          >
                            <Trash2 size={16} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                      )}
                    </Group>

                    {/* Formulario de creación de mandato */}
                    {isCreatingMandate && activeCaseForMandate === caseItem.id && (
                      <Box p="md" style={{  borderRadius: '8px' }}>
                        <Title order={6} mb="md">Crear Nuevo Mandato</Title>
                        <MandateForm
                          mode="create"
                          onSubmit={async (data, file) => {
                            await createMandate(data as CreateMandatesData, file);
                          }}
                          onCancel={handleCancelEditingMandate}
                          isLoading={isLoadingMandate}
                          errors={mandateErrors}
                        />
                      </Box>
                    )}

                    {/* Lista de mandatos */}
                    {caseItem.mandates && caseItem.mandates.length > 0 ? (
                      <Stack gap="sm">
                        {caseItem.mandates.map((mandate) => (
                          <Card key={mandate.id} withBorder padding="sm" bg="#fafafa">
                            {editingMandateId === mandate.id && activeCaseForMandate === caseItem.id ? (
                              <Box p="md" style={{ borderRadius: '8px' }}>
                                <Title order={6} mb="md">Editar Mandato</Title>
                                <MandateForm
                                  mode="edit"
                                  initialData={mandate}
                                  onSubmit={async (data, file) => {
                                    await updateMandate(mandate.id, data, file);
                                  }}
                                  onCancel={handleCancelEditingMandate}
                                  isLoading={isLoadingMandate}
                                  errors={mandateErrors}
                                />
                              </Box>
                            ) : (
                              <Stack gap="xs">
                                <Group justify="space-between">
                                  <Group gap="xs">
                                    <Text fw={600} size="sm">{mandate.type}</Text>
                                    <Badge size="sm" color={getMandateStatusColor(mandate.status)}>
                                      {mandate.status}
                                    </Badge>
                                  </Group>
                                  <Group gap="xs">
                                    <Tooltip label="Editar mandato">
                                      <ActionIcon
                                        variant="subtle"
                                        color="blue"
                                        size="sm"
                                        onClick={() => handleStartEditingMandate(caseItem.id, mandate.id)}
                                      >
                                        <Edit3 size={14} />
                                      </ActionIcon>
                                    </Tooltip>
                                    <Tooltip label="Eliminar mandato">
                                      <ActionIcon
                                        variant="subtle"
                                        color="red"
                                        size="sm"
                                        onClick={() => {
                                          if (window.confirm('¿Estás seguro de eliminar este mandato?')) {
                                            deleteMandate(mandate.id);
                                          }
                                        }}
                                      >
                                        <Trash2 size={14} />
                                      </ActionIcon>
                                    </Tooltip>
                                  </Group>
                                </Group>

                                <Text size="xs" c="dimmed">
                                  Fecha de Emisión: {new Date(mandate.issue_date).toLocaleDateString('es-ES')}
                                </Text>

                                {mandate.description && (
                                  <Text size="sm">{mandate.description}</Text>
                                )}

                                {/* Archivo del mandato con FileView */}
                                {getMandateFileInfo(mandate) && (
                                  <Box mt="xs">
                                    <Text size="xs" c="dimmed" mb="xs">Archivo Adjunto</Text>
                                    <FileView
                                      fileInfo={getMandateFileInfo(mandate)!}
                                      label="Archivo del Mandato"
                                      updateFile={async (file) => {
                                        return await uploadMandateFile(mandate.id, file);
                                      }}
                                      onSuccess={onRefresh}
                                      acceptImages={true}
                                      acceptPdf={true}
                                    />
                                  </Box>
                                )}
                              </Stack>
                            )}
                          </Card>
                        ))}
                      </Stack>
                    ) : !isCreatingMandate || activeCaseForMandate !== caseItem.id ? (
                      <Alert color="gray" variant="light">
                        <Text size="sm">No hay mandatos judiciales registrados</Text>
                      </Alert>
                    ) : null}
                  </Stack>
                )}
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      ) : !isCreatingCase ? (
        <Alert color="yellow" variant="light">
          <Text size="sm">No hay casos judiciales registrados</Text>
        </Alert>
      ) : null}
    </Card>
  );
};
