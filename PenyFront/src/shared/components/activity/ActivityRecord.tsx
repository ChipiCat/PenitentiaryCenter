import React from 'react';
import { Group, Text, Divider } from '@mantine/core';
import { Clock } from 'lucide-react';
import { UserAvatar } from '../user/UserAvatar';
import { ActionBadge, type ActionType } from './ActionBadge';

export interface ActivityUser {
  name: string;
  role: string;
  avatar?: string;
}

export interface ActivityRecordData {
  id: string;
  user: ActivityUser;
  action: string;
  target: string;
  description: string;
  timestamp: string;
  type: ActionType;
}

export interface ActivityRecordProps {
  activity: ActivityRecordData;
  showDivider?: boolean;
  onUserClick?: (user: ActivityUser) => void;
  onTargetClick?: (target: string) => void;
}

export const ActivityRecord: React.FC<ActivityRecordProps> = ({
  activity,
  showDivider = false,
  onUserClick,
  onTargetClick
}) => {
  return (
    <>
      <Group justify="space-between" align="flex-start">
        <Group align="flex-start" gap="md">
          <div onClick={() => onUserClick?.(activity.user)} style={{ cursor: onUserClick ? 'pointer' : 'default' }}>
            <UserAvatar
              name={activity.user.name}
              role={activity.user.role}
              avatar={activity.user.avatar}
              size="md"
            />
          </div>
          
          <div style={{ flex: 1 }}>
            <Group gap="xs" mb={4}>
              <Text 
                fw={500} 
                size="sm"
                style={{ cursor: onUserClick ? 'pointer' : 'default' }}
                onClick={() => onUserClick?.(activity.user)}
              >
                {activity.user.name}
              </Text>
              <Text size="xs" c="dimmed">
                ({activity.user.role})
              </Text>
            </Group>
            
            <Text size="sm" mb={2}>
              {activity.action} → {' '}
              <Text 
                span 
                fw={500} 
                c="blue"
                style={{ cursor: onTargetClick ? 'pointer' : 'default' }}
                onClick={() => onTargetClick?.(activity.target)}
              >
                {activity.target}
              </Text>
            </Text>
            
            <Text size="xs" c="dimmed">
              {activity.description}
            </Text>
          </div>
        </Group>

        <Group gap="xs" align="center">
          <ActionBadge type={activity.type} />
          <div style={{ textAlign: 'right' }}>
            <Text size="xs" c="dimmed">
              <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
              {activity.timestamp}
            </Text>
          </div>
        </Group>
      </Group>
      
      {showDivider && <Divider my="md" />}
    </>
  );
};