import React from 'react';
import { Grid } from '@mantine/core';
import type { CompletePrisonerProfile } from '../../../../shared/services/prisonersApi';
import { BasicInfoCard } from './cards/BasicInfoCard';
import { IdentityCard } from './cards/IdentityCard';
import { PersonalInfoCard } from './cards/PersonalInfoCard';
import { PenitentiaryCard } from './cards/PenitentiaryCard';
import { ContactsCard } from './cards/ContactsCard';

interface ProfileContentProps {
  profile: CompletePrisonerProfile;
}

export const ProfileContent: React.FC<ProfileContentProps> = ({ profile }) => {
  const { prisoner, identity, personal, penitentiary, contacts } = profile;

  return (
    <Grid>
      <Grid.Col span={{ base: 12, sm: 6 }}>
        <BasicInfoCard prisoner={prisoner} />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6 }}>
        <IdentityCard identity={identity} />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6 }}>
        <PersonalInfoCard personal={personal} />
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6 }}>
        <PenitentiaryCard penitentiary={penitentiary} />
      </Grid.Col>

      <Grid.Col span={12}>
        <ContactsCard contacts={contacts} />
      </Grid.Col>
    </Grid>
  );
};