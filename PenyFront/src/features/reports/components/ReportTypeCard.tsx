import { Paper, Group, ThemeIcon, Text, Button } from '@mantine/core';
import { Download } from 'lucide-react';
import type { ReportType } from '../../../shared/types/report/reportTypes';

interface ReportTypeCardProps {
  report: ReportType;
}

export const ReportTypeCard = ({ report }: ReportTypeCardProps) => {
  return (
    <Paper p="md" withBorder radius="sm">
      <Group justify="space-between">
        <Group>
          <ThemeIcon color={report.color} variant="light" size="lg">
            <report.icon size={20} />
          </ThemeIcon>
          <div>
            <Text fw={500} size="sm">{report.title}</Text>
            <Text size="xs" c="dimmed">{report.description}</Text>
          </div>
        </Group>
        <Button
          size="xs"
          color={report.color}
          onClick={report.action}
          leftSection={<Download size={14} />}
        >
          Generar
        </Button>
      </Group>
    </Paper>
  );
};