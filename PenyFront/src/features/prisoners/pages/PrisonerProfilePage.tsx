import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Stack, Alert, Button, Group } from '@mantine/core';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { completeProfileService } from '../../../shared/services';
import type { CompletePrisonerProfile } from '../../../shared/types';
import { ROUTES } from '../../../shared/config/routes';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ProfileContent } from '../components/profile/ProfileContent';
import { LoadingState } from '../../../shared/components/LoadingState';
import { exportPrisonerPdf } from '../components/profile/exportPrisonerPdf';

export const PrisonerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<CompletePrisonerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!id) {
        setError('ID de prisionero no proporcionado');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 Cargando perfil del prisionero:', id);
        
        const data = await completeProfileService.getCompleteProfile(id);
        if (data) {
          setProfile(data);
          console.log('✅ Perfil cargado:', data);
        } else {
          setError('Prisionero no encontrado');
        }
      } catch (err) {
        setError('Error al cargar el perfil del prisionero');
        console.error('❌ Error cargando perfil:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  useEffect(() => {
  const handleExportPDF = () => {
    if (profile) {
      const fecha = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
      exportPrisonerPdf(profile, fecha);
    }
  };
  window.addEventListener('SIGEPEN-export-recluso-pdf', handleExportPDF);
  return () => window.removeEventListener('SIGEPEN-export-recluso-pdf', handleExportPDF);
}, [profile]);

  const handleBack = () => {
    navigate(ROUTES.PRISONERS);
  };

  const handleEdit = () => {
    console.log('📝 Editar prisionero:', id);
    // TODO: Implementar edición
  };

  if (loading) {
    return <LoadingState message="Cargando perfil del prisionero..." />;
  }

  if (error || !profile) {
    return (
      <Container size="lg">
        <Stack gap="lg">
          <Alert icon={<AlertCircle size={16} />} color="red" title="Error">
            {error || 'No se pudo cargar el perfil del prisionero'}
          </Alert>
          <Group>
            <Button 
              onClick={handleBack} 
              leftSection={<ArrowLeft size={16} />}
              variant="light"
            >
              Volver a la lista
            </Button>
          </Group>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Stack gap="lg">
        <ProfileHeader 
          profile={profile}
          onBack={handleBack}
          onEdit={handleEdit}
        />
        <ProfileContent profile={profile} />
      </Stack>
    </Container>
  );
};