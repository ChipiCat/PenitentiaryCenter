import React from 'react';
import { Card, Group, ActionIcon, Avatar, Title, Text, Badge, Button, Tooltip } from '@mantine/core';
import { ArrowLeft, Edit, User, Shield } from 'lucide-react';
import type { CompletePrisonerProfile } from '../../../../shared/types';

interface ProfileHeaderProps {
  profile: CompletePrisonerProfile;
  onBack: () => void;
  onEdit: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  profile, 
  onBack, 
  onEdit 
}) => {
  const { prisoner, identity } = profile;
  const fullName = identity ? `${identity.first_name} ${identity.surname}` : 'Sin nombre';

  return (
    <Card withBorder padding="lg">
      <Group justify="space-between">
        <Group>
          <ActionIcon 
            variant="subtle" 
            onClick={onBack}
            size="lg"
          >
            <ArrowLeft size={20} />
          </ActionIcon>
          
          <Group gap="md">
            <Avatar 
              size="lg" 
              src={identity?.photo_file?.url || undefined}
              alt={fullName}
              color="blue"
            >
              <User size={24} />
            </Avatar>
            
            <div>
              <Title order={1} size="h2">
                {fullName}
              </Title>
              <Group gap="xs" mt={4}>
                <Text c="dimmed" size="sm">
                  Registro: {prisoner.registration_number}
                </Text>
                {prisoner.fiscal_file_number && (
                  <>
                    <Text c="dimmed" size="sm">•</Text>
                    <Text c="dimmed" size="sm">
                      Expediente: {prisoner.fiscal_file_number}
                    </Text>
                  </>
                )}
              </Group>
            </div>
          </Group>
        </Group>
        
        <Group>
          <Badge 
            color={prisoner.status === 'Activo' ? 'green' : 
                   prisoner.status === 'Trasladado' ? 'blue' :
                   prisoner.status === 'Liberado' ? 'gray' : 'red'}
            size="lg"
            variant="light"
            leftSection={<Shield size={12} />}
          >
            {prisoner.status}
          </Badge>
          
          <Tooltip label="Editar información del prisionero">
            <Button 
              leftSection={<Edit size={16} />}
              onClick={onEdit}
              variant="light"
              color="blue"
            >
              Editar
            </Button>
          </Tooltip>
        </Group>
      </Group>
    </Card>
  );
};