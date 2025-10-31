import React from "react";
import { Card, Group, Title, Text, Stack, ThemeIcon } from "@mantine/core";
import type { ActivityLog } from "../../../../../shared/types/activityLogTypes";
import { Activity } from "lucide-react";

interface ActivityCardProps {
  activities?: ActivityLog[];
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activities }) => (
  <Card withBorder padding="lg" h="100%">
    <Group mb="md" gap={6}>
      <ThemeIcon variant="transparent" color="#20263c">
        <Activity size={20} />
      </ThemeIcon>
      <Title order={3} size="h4">
        Actividad
      </Title>
    </Group>
    <Stack gap="md">
      {activities && activities.length > 0 ? (
        activities.map((act) => (
          <Card key={act.id} withBorder padding="md" mb="sm">
            <Text fw={600}>{act.description}</Text>
            <Text size="sm" c="dimmed">
              {new Date(act.timestamp).toLocaleDateString("es-ES")}
            </Text>
          </Card>
        ))
      ) : (
        <Text size="sm" c="dimmed">
          Sin actividad registrada.
        </Text>
      )}
    </Stack>
  </Card>
);
