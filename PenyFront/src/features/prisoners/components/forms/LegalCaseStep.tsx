import React, { useCallback } from "react";
import { Stack, Title, Card, Text, Button, Group } from "@mantine/core";
import { Plus } from "lucide-react";
import { CaseCard } from "./CaseCard";
import type { CaseFormData, MandateFormData } from "../../../../shared/types/forms/legalCaseFormTypes";

interface LegalCaseStepProps {
  data: { cases: CaseFormData[] };
  onUpdate: (updates: { cases: CaseFormData[] }) => void;
  errors?: Record<string, string>;
}

export const LegalCaseStep: React.FC<LegalCaseStepProps> = ({
  data,
  onUpdate,
  errors = {},
}) => {
  const cases = data.cases || [];

  const handleAddCase = useCallback(() => {
    const newCase: CaseFormData = {
      case_number: '',
      crime: '',
      status: '',
      start_date: '',
      end_date: '',
      court_name: '',
      judge_name: '',
      sentence_years: 0,
      remarks: '',
      mandates: [],
      tempId: `case_${Date.now()}_${Math.random()}`,
    };
    onUpdate({ cases: [...cases, newCase] });
  }, [cases, onUpdate]);

  const handleRemoveCase = useCallback((index: number) => {
    const updatedCases = cases.filter((_, i) => i !== index);
    onUpdate({ cases: updatedCases });
  }, [cases, onUpdate]);

  const handleCaseChange = useCallback((
    caseIndex: number,
    field: keyof CaseFormData,
    value: any
  ) => {
    const updatedCases = [...cases];
    updatedCases[caseIndex] = {
      ...updatedCases[caseIndex],
      [field]: value,
    };
    onUpdate({ cases: updatedCases });
  }, [cases, onUpdate]);

  const handleAddMandate = useCallback((caseIndex: number) => {
    const newMandate: MandateFormData = {
      type: 'Detencion',
      issue_date: '',
      description: '',
      status: 'Vigente',
      tempId: `mandate_${Date.now()}_${Math.random()}`,
    };
    
    const updatedCases = [...cases];
    updatedCases[caseIndex] = {
      ...updatedCases[caseIndex],
      mandates: [...updatedCases[caseIndex].mandates, newMandate],
    };
    onUpdate({ cases: updatedCases });
  }, [cases, onUpdate]);

  const handleRemoveMandate = useCallback((caseIndex: number, mandateIndex: number) => {
    const updatedCases = [...cases];
    updatedCases[caseIndex] = {
      ...updatedCases[caseIndex],
      mandates: updatedCases[caseIndex].mandates.filter((_, i) => i !== mandateIndex),
    };
    onUpdate({ cases: updatedCases });
  }, [cases, onUpdate]);

  const handleMandateChange = useCallback((
    caseIndex: number,
    mandateIndex: number,
    field: keyof MandateFormData,
    value: any
  ) => {
    const updatedCases = [...cases];
    const updatedMandates = [...updatedCases[caseIndex].mandates];
    updatedMandates[mandateIndex] = {
      ...updatedMandates[mandateIndex],
      [field]: value,
    };
    updatedCases[caseIndex] = {
      ...updatedCases[caseIndex],
      mandates: updatedMandates,
    };
    onUpdate({ cases: updatedCases });
  }, [cases, onUpdate]);

  return (
    <Stack gap="lg">
      <Card withBorder padding="lg">
        <Group justify="space-between" mb="md">
          <div>
            <Title order={4} size="h5">
              Casos Judiciales
            </Title>
            <Text size="sm" c="dimmed" mt="xs">
              Registra los casos judiciales del interno y sus mandatos asociados
            </Text>
          </div>
          <Button
            leftSection={<Plus size={16} />}
            onClick={handleAddCase}
          >
            Agregar Caso
          </Button>
        </Group>

        {cases.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            No hay casos registrados. Agrega un caso para comenzar.
          </Text>
        ) : (
          <Stack gap="md">
            {cases.map((caseData, index) => (
              <CaseCard
                key={caseData.tempId || index}
                caseData={caseData}
                index={index}
                onChange={handleCaseChange}
                onMandateChange={handleMandateChange}
                onRemove={handleRemoveCase}
                onAddMandate={handleAddMandate}
                onRemoveMandate={handleRemoveMandate}
                errors={errors}
              />
            ))}
          </Stack>
        )}
      </Card>
    </Stack>
  );
};
