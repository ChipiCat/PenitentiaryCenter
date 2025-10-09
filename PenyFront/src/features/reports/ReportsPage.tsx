import { Container, Title, Text, Grid, Stack } from '@mantine/core';
import { SystemStatsCard } from './components/SystemStatsCard';
import { ReportGenerationSection } from './components/ReportGenerationSection';
import { FiltersSection } from './components/FiltersSection';
import { useReports } from './hooks/useReports';

const ReportsPage = () => {
  const {
    filters,
    systemStats,
    reportTypes,
    filtersHandlers,
    handleExportToExcel,
    handleClearFilters,
  } = useReports();

  return (
    <Container size="xl" py="md">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={2} mb={4}>Reportes del Sistema</Title>
          <Text c="dimmed">Genera reportes estadísticos y exporta información del centro penitenciario</Text>
        </div>

        {/* Estadísticas principales */}
        <Grid>
          {systemStats.map((stat, index) => (
            <Grid.Col key={index} span={{ base: 12, xs: 6, md: 3 }}>
              <SystemStatsCard stat={stat} />
            </Grid.Col>
          ))}
        </Grid>

        {/* Sección principal con reportes y filtros */}
        <Grid>
          {/* Generar Reportes */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <ReportGenerationSection reportTypes={reportTypes} />
          </Grid.Col>

          {/* Filtros Personalizados */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <FiltersSection
              filters={filters}
              onFiltersChange={filtersHandlers}
              onClearFilters={handleClearFilters}
              onExportToExcel={handleExportToExcel}
            />
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
};

export default ReportsPage;