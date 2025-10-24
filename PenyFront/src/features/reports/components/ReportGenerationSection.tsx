import { Paper, Title, Stack } from '@mantine/core';
import { ReportTypeCard } from './ReportTypeCard';
import type { ReportType } from '../../../shared/types/report/reportTypes';

interface ReportGenerationSectionProps {
  reportTypes: ReportType[];
}

export const ReportGenerationSection = ({ reportTypes }: ReportGenerationSectionProps) => {
  return (
    <Paper p="lg" radius="md" withBorder h="100%">
      <Title order={4} mb="md">Generar Reportes</Title>
      <Stack gap="md">
        {reportTypes.map((report) => (
          <ReportTypeCard key={report.id} report={report} />
        ))}
      </Stack>
    </Paper>
  );
};
