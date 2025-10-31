import React from "react";
import {
  Card,
  Group,
  Title,
  ThemeIcon,
  Stack,
  Text,
  Divider,
  Badge,
  Alert,
  Image,
  Grid,
} from "@mantine/core";
import { Stethoscope } from "lucide-react";
import type { MedicalRecord } from "../../../../../shared/types";

interface MedicalExamCardProps {
  exam?: MedicalRecord;
}

export const MedicalExamCard: React.FC<MedicalExamCardProps> = ({ exam }) => {
  return (
    <Card withBorder padding="lg" h="100%">
      <Group mb="md" gap={6}>
        <ThemeIcon variant="transparent" color="#20263c">
          <Stethoscope size={20} />
        </ThemeIcon>
        <Title order={3} size="h4">
          Examen Médico
        </Title>
      </Group>
      <Divider mb="md" />
      {exam ? (
        <Grid gutter="md" mb="md">
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed">
              Nombre del Doctor
            </Text>
            <Text fw={500}>{exam.doctor_name}</Text>
            <Text size="sm" c="dimmed" mt="md">
              Fecha de Examen
            </Text>
            <Text fw={500}>
              {exam.examination_date
                ? new Date(exam.examination_date).toLocaleDateString("es-ES")
                : <span style={{color: '#868e96'}}>No hay fecha registrada</span>}
            </Text>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text size="sm" c="dimmed">
              Referencia/Ubicación
            </Text>
            {exam.reference_number ? (
              <Text fw={500}>{exam.reference_number}</Text>
            ) : (
              <Text c="dimmed">No hay referencia registrada</Text>
            )}

            <Text size="sm" c="dimmed" mt="md">
              Notas
            </Text>
            {exam.notes ? (
              <Text>{exam.notes}</Text>
            ) : (
              <Text c="dimmed">No hay notas registradas</Text>
            )}

            <Stack gap="xs" mt="md">
              <Text size="sm" c="dimmed">
                Archivos adjuntos
              </Text>
              <Group>
                {exam.attachment_url ? (
                  Array.isArray(exam.attachment_url) ? (
                    exam.attachment_url.length ? (
                      exam.attachment_url.map((url, idx) =>
                        url.match(/\.(jpg|jpeg|png)$/i) ? (
                          <Image
                            key={idx}
                            src={url}
                            alt={`Archivo médico ${idx + 1}`}
                            width={64}
                            height={64}
                            radius="md"
                          />
                        ) : (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Badge color="grape" variant="light">
                              Ver PDF
                            </Badge>
                          </a>
                        )
                      )
                    ) : (
                      <Text c="dimmed">No hay archivos adjuntos</Text>
                    )
                  ) : exam.attachment_url.match(/\.(jpg|jpeg|png)$/i) ? (
                    <Image
                      src={exam.attachment_url}
                      alt="Archivo médico"
                      width={64}
                      height={64}
                      radius="md"
                    />
                  ) : (
                    <a
                      href={exam.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Badge color="grape" variant="light">
                        Ver PDF
                      </Badge>
                    </a>
                  )
                ) : (
                  <Text c="dimmed">No hay archivos adjuntos</Text>
                )}
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>
      ) : (
        <Alert color="yellow" variant="light">
          <Text size="sm">No hay examen médico registrado</Text>
        </Alert>
      )}
    </Card>
  );
};
