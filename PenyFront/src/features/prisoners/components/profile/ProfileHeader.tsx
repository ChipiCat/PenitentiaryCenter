import React from "react";
import {
  Card,
  Group,
  Avatar,
  Title,
  Text,
  Badge,
  Button,
  Tabs,
} from "@mantine/core";
import {
  User,
  UserCircle2,
  HeartPulse,
  Gavel,
  Clock,
  FileDown,
  ArrowLeft,
} from "lucide-react";
import type { CompletePrisonerProfile } from "../../../../shared/types";

interface ProfileHeaderProps {
  profile: CompletePrisonerProfile;
  onBack: () => void;
  tabValue: string;
  onTabChange: (value: string | null) => void;
  isEditMode?: boolean;
}

const getAge = (birthDate?: string) => {
  if (!birthDate) return "-";
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  onBack,
  tabValue,
  onTabChange,
  isEditMode = false,
}) => {
  const { prisoner, identity, personal, penitentiary } = profile;
  const fullName = identity
    ? `${identity.first_name} ${identity.surname}`
    : "Sin nombre";

  return (
    <Card withBorder padding="lg" style={{ maxWidth: 1080, paddingBottom: 0 }}>
      <Group align="center" style={{ width: "100%" }}>
        <Button
          variant="subtle"
          color="gray"
          onClick={onBack}
          style={{ borderRadius: "50%", padding: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <ArrowLeft size={20} />
        </Button>
        <Avatar
          size={80}
          src={identity?.photo_file?.url || undefined}
          alt={fullName}
          radius="xl"
          color="blue"
          style={{ border: "2px solid #e0e0e0", marginRight: 32 }}
        >
          <User size={32} />
        </Avatar>

        <div style={{ flex: 1 }}>
          <Title order={2} fw={700} mb={2}>
            {fullName}
          </Title>
          <Group gap="xs" align="center" style={{ marginTop: 8 }}>
            <Text c="dimmed" size="sm">
              CI: {personal?.id_document_number}
            </Text>
            <Text c="dimmed" size="sm">
              Edad: {getAge(identity?.birth_date)} años
            </Text>
            <Text c="dimmed" size="sm">
              Sexo: {personal?.gender}
            </Text>
            <Text c="dimmed" size="sm">
              Celda: {penitentiary?.cell_number}
            </Text>
            <Badge
              color="green"
              size="lg"
              variant="light"
              style={{
                background: "#d1fae5",
                color: "#059669",
                fontWeight: 500,
                marginLeft: 12,
                height: 28,
                display: "flex",
                alignItems: "center",
                borderRadius: 16,
                padding: "0 16px",
              }}
            >
              {prisoner.status}
            </Badge>
          </Group>
        </div>

        <Group gap="md" ml="auto">
          <Button
            leftSection={<FileDown size={16} />}
            variant="gradient"
            gradient={{ from: "violet", to: "blue", deg: 90 }}
            style={{
              minWidth: 160,
              fontWeight: 500,
              fontSize: 16,
              borderRadius: 12,
              height: 40,
            }}
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("SIGEPEN-export-recluso-pdf")
              )
            }
          >
            Descargar PDF
          </Button>
          
        </Group>
      </Group>
      
      {/* Solo mostrar las tabs cuando NO está en modo edición */}
      {!isEditMode && (
        <Tabs
          value={tabValue}
          onChange={onTabChange}
          style={{ marginTop: 24, paddingInline: 0 }}
          variant="default"
        >
          <Tabs.List style={{ borderBottom: "none" }}>
            <Tabs.Tab value="general" leftSection={<UserCircle2 size={16} />}>
              Información General
            </Tabs.Tab>
            <Tabs.Tab value="medical" leftSection={<HeartPulse size={18} />}>
              Información Médica
            </Tabs.Tab>
            <Tabs.Tab value="legal" leftSection={<Gavel size={18} />}>
              Situación Legal
            </Tabs.Tab>
            <Tabs.Tab value="activity" leftSection={<Clock size={18} />}>
              Actividad
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      )}
    </Card>
  );
};
