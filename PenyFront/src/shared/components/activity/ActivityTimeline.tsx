import React from 'react';
import { Card, Text, Group, Stack, Badge, Timeline } from '@mantine/core';

export interface ActivityItem {
  id: string | number;
  entityId: string;
  type: string;
  title: string;
  description: string;
  date: string;
  time: string;
  status?: string;
  priority?: 'low' | 'normal' | 'medium' | 'high';
}

export interface ActivityTimelineProps {
  activities: ActivityItem[];
  getIcon: (type: string) => React.JSX.Element;
  getColor: (type: string, status?: string) => string;
  getTypeLabel: (type: string) => string;
  emptyMessage?: string;
  showPriority?: boolean;
  showTime?: boolean;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  getIcon,
  getColor,
  getTypeLabel,
  emptyMessage = "No hay actividades registradas",
  showPriority = true,
  showTime = true
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'gray';
      default: return 'blue';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Normal';
    }
  };

  if (activities.length === 0) {
    return (
      <Card withBorder padding="lg">
        <Text ta="center" c="dimmed" py="xl">
          {emptyMessage}
        </Text>
      </Card>
    );
  }

  return (
    <Card withBorder padding="lg">
      <Timeline bulletSize={24} lineWidth={2}>
        {activities.map((activity) => (
          <Timeline.Item
            key={activity.id}
            bullet={getIcon(activity.type)}
            title={
              <Group justify="space-between" align="flex-start">
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Group gap="xs">
                    <Text fw={500}>{activity.title}</Text>
                    <Badge 
                      size="xs" 
                      color={getColor(activity.type, activity.status)}
                      variant="light"
                    >
                      {getTypeLabel(activity.type)}
                    </Badge>
                    {showPriority && activity.priority === 'high' && (
                      <Badge 
                        size="xs" 
                        color={getPriorityColor(activity.priority)} 
                        variant="filled"
                      >
                        {getPriorityLabel(activity.priority)}
                      </Badge>
                    )}
                  </Group>
                  <Text size="sm" c="dimmed">
                    {activity.description}
                  </Text>
                </Stack>
                <Stack gap="xs" align="flex-end">
                  <Text size="xs" c="dimmed">
                    {new Date(activity.date).toLocaleDateString()}
                  </Text>
                  {showTime && (
                    <Text size="xs" c="dimmed">
                      {activity.time}
                    </Text>
                  )}
                </Stack>
              </Group>
            }
            color={getColor(activity.type, activity.status)}
          />
        ))}
      </Timeline>
    </Card>
  );
};