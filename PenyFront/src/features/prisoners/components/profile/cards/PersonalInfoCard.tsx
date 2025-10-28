import React from "react";
import {
  Card,
  Group,
  Title,
  ThemeIcon,
  Stack,
  Text,
  Badge,
  Alert,
} from "@mantine/core";
import { Users } from "lucide-react";
import type { Personal } from "../../../../../shared/types";

interface PersonalInfoCardProps {
  personal?: Personal;
}

export const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({
  personal,
}) => {
  return (
    <Card withBorder padding="lg" h="100%">
      <Group mb="md">
        <ThemeIcon variant="light" color="purple">
          <Users size={20} />
        </ThemeIcon>
        <Title order={3} size="h4">
          Información Personal
        </Title>
      </Group>

      {personal ? (
        <Stack gap="md">
          {personal.gender && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Género
              </Text>
              <Badge variant="outline" size="sm">
                {personal.gender}
              </Badge>
            </Group>
          )}

          {personal.marital_status && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Estado Civil
              </Text>
              <Text fw={500}>{personal.marital_status}</Text>
            </Group>
          )}

          {personal.education_level && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Nivel de Educación
              </Text>
              <Text fw={500}>{personal.education_level}</Text>
            </Group>
          )}

          {personal.occupation && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Ocupación
              </Text>
              <Text fw={500}>{personal.occupation}</Text>
            </Group>
          )}

          {personal.id_document_type && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Tipo de documento
              </Text>
              <Text fw={500}>{personal.id_document_type}</Text>
            </Group>
          )}

          {personal.id_document_number && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Número de documento
              </Text>
              <Text fw={500}>{personal.id_document_number}</Text>
            </Group>
          )}

          {personal.languages && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Idiomas
              </Text>
              <Text fw={500}>{personal.languages}</Text>
            </Group>
          )}

        </Stack>
      ) : (
        <Alert color="yellow" variant="light">
          <Text size="sm">No hay información personal registrada</Text>
        </Alert>
      )}
    </Card>
  );
};
