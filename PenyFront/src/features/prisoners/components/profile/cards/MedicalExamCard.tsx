import React from "react";
import {
  Card,
  Group,
  Title,
  ThemeIcon,
  Stack,
  Text,
  Divider,
  Button,
  Alert,
  Grid,
  ActionIcon,
  Tooltip,
  Accordion,
  Box,
} from "@mantine/core";
import { Stethoscope, Plus, Edit3, Trash2 } from "lucide-react";
import type { MedicalRecord } from "../../../../../shared/types";
import { useMedicalRecordEditor } from "../hooks/useMedicalRecordEditor";
import { MedicalRecordForm } from "../forms/MedicalRecordForm";
import FileView from "../../../../../shared/components/FileView";

interface MedicalExamCardProps {
  exams: MedicalRecord[];
  prisonerId: string;
  onRefresh?: () => void;
}

export const MedicalExamCard: React.FC<MedicalExamCardProps> = ({ 
  exams, 
  prisonerId, 
  onRefresh 
}) => {
  const {
    isCreating,
    editingRecordId,
    isLoading,
    errors,
    startCreating,
    startEditing,
    cancelEditing,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    uploadMedicalFile,
  } = useMedicalRecordEditor({ prisonerId, onSuccess: onRefresh });

  return (
    <Card withBorder padding="lg" h="100%">
      <Group justify="space-between" mb="md">
        <Group gap={6}>
          <ThemeIcon variant="transparent" color="#20263c">
            <Stethoscope size={20} />
          </ThemeIcon>
          <Title order={3} size="h4">
            Exámenes Médicos
          </Title>
        </Group>
        
        {!isCreating && !editingRecordId && (
          <Button
            leftSection={<Plus size={16} />}
            size="xs"
            onClick={startCreating}
          >
            Nuevo Registro
          </Button>
        )}
      </Group>
      
      <Divider mb="md" />

      {/* Formulario de creación */}
      {isCreating && (
        <Box mb="md" p="md" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
          <Title order={5} mb="md">Crear Nuevo Registro Médico</Title>
          <MedicalRecordForm
            mode="create"
            onSubmit={async (data, file) => {
              await createMedicalRecord(data as any, file);
              onRefresh && onRefresh();
            }}
            onCancel={cancelEditing}
            isLoading={isLoading}
            errors={errors}
          />
        </Box>
      )}

      {/* Lista de registros médicos */}
      {exams && exams.length > 0 ? (
        <Accordion variant="separated">
          {exams.map((exam) => (
            <Accordion.Item key={exam.id} value={exam.id}>
              <Accordion.Control>
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>{exam.doctor_name}</Text>
                    <Text size="sm" c="dimmed">
                      {exam.examination_date
                        ? new Date(exam.examination_date).toLocaleDateString("es-ES")
                        : "Fecha no registrada"}
                    </Text>
                  </div>
                </Group>
              </Accordion.Control>
              
              <Accordion.Panel>
                {editingRecordId === exam.id ? (
                  <Box p="md" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <Title order={5} mb="md">Editar Registro Médico</Title>
                    <MedicalRecordForm
                      mode="edit"
                      initialData={exam}
                      onSubmit={async (data, file) => {
                        await updateMedicalRecord(exam.id, data, file);
                        onRefresh && onRefresh();
                      }}
                      onCancel={cancelEditing}
                      isLoading={isLoading}
                      errors={errors}
                    />
                  </Box>
                ) : (
                  <Stack gap="md">
                    <Grid gutter="md">
                      <Grid.Col span={6}>
                        <Text size="sm" c="dimmed">
                          Referencia/Ubicación
                        </Text>
                        <Text fw={500}>
                          {exam.reference_number || <span style={{color: '#868e96'}}>No registrado</span>}
                        </Text>

                        <Text size="sm" c="dimmed" mt="md">
                          Notas
                        </Text>
                        <Text>
                          {exam.notes || <span style={{color: '#868e96'}}>Sin notas</span>}
                        </Text>
                      </Grid.Col>

                      <Grid.Col span={6}>
                        <Text size="sm" c="dimmed" mb="xs">
                          Archivo Adjunto
                        </Text>
                        
                        {exam.file ? (
                          <FileView
                            fileInfo={exam.file}
                            label="Archivo Médico"
                            updateFile={async (file) => {
                              return await uploadMedicalFile(exam.id, file);
                            }}
                            onSuccess={onRefresh}
                            acceptImages={true}
                            acceptPdf={true}
                          />
                        ) : (
                          <Alert color="gray" variant="light">
                            <Text size="sm">No hay archivo adjunto</Text>
                          </Alert>
                        )}
                      </Grid.Col>
                    </Grid>

                    <Divider />

                    <Group justify="flex-end">
                      <Tooltip label="Editar registro">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={() => startEditing(exam.id)}
                        >
                          <Edit3 size={16} />
                        </ActionIcon>
                      </Tooltip>
                      
                      <Tooltip label="Eliminar registro">
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => {
                            if (window.confirm('¿Estás seguro de eliminar este registro médico?')) {
                              deleteMedicalRecord(exam.id);
                            }
                          }}
                        >
                          <Trash2 size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  </Stack>
                )}
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      ) : !isCreating ? (
        <Alert color="yellow" variant="light">
          <Text size="sm">No hay registros médicos registrados</Text>
        </Alert>
      ) : null}
    </Card>
  );
};
