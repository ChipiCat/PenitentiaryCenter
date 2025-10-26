import React from "react";
import { Paper, Group, Title, Stack, Text } from "@mantine/core";
import { ActivityRecord, type ActivityRecordData } from "./ActivityRecord";
import type { ActivityUser } from "../../types/activityLogTypes";

export interface ActivityListProps {
  title: string;
  activities: ActivityRecordData[];
  emptyMessage?: string;
  onUserClick?: (user: ActivityUser) => void;
  onTargetClick?: (target: string) => void;
  maxHeight?: string;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  title,
  activities,
  emptyMessage = "No hay actividades registradas",
  onUserClick,
  onTargetClick,
  maxHeight,
}) => {
  return (
    <Paper p="md" withBorder>
      <Group justify="space-between" mb="md">
        <Title order={3} size="h4">
          {title} ({activities.length})
        </Title>
      </Group>

      {activities.length === 0 ? (
        <Text ta="center" c="dimmed" py="xl">
          {emptyMessage}
        </Text>
      ) : (
        <div style={{ maxHeight, overflowY: maxHeight ? "auto" : "visible" }}>
          <Stack gap="md">
            {activities.map((activity, index) => (
              <ActivityRecord
                key={activity.id}
                activity={activity}
                showDivider={index < activities.length - 1}
                onUserClick={onUserClick}
                onTargetClick={onTargetClick}
              />
            ))}
          </Stack>
        </div>
      )}
    </Paper>
  );
};
