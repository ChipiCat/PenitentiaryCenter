import React from "react";
import { Group, ThemeIcon, Title, Grid, Box } from "@mantine/core";
import { InfoGrid } from "./InfoGrid";
import classes from "../../styles/GeneralBlock.module.css";

type GenericInfoSectionProps = {
  icon: React.ReactNode;
  title: string;
  button?: React.ReactNode;
  fieldsLeft: Array<{
    label: string;
    value: React.ReactNode;
    mt?: string | number;
  }>;
  fieldsRight: Array<{
    label: string;
    value: React.ReactNode;
    mt?: string | number;
  }>;
  order?: 2 | 3 | 4;
  size?: "h2" | "h3" | "h4";
  color?: string;
  gap?: number;
  leftSpan?: number;
  rightSpan?: number;
};

export const GenericInfoSection = ({
  icon,
  title,
  button,
  fieldsLeft,
  fieldsRight,
  order = 2,
  size = "h3",
  color = "#20263c",
  gap = 2,
  leftSpan = 6,
  rightSpan = 6,
}: GenericInfoSectionProps) => (
  <Box className={classes.sectionBox}>
    <Group mb={0} justify="space-between" align="center" style={{ marginBottom: 24 }}>
      <Group gap={gap} align="center" mb={0}>
        <ThemeIcon variant="transparent" color={color}>
          {icon}
        </ThemeIcon>
        <Title order={order} size={size}>
          {title}
        </Title>
      </Group>
      {button}
    </Group>
    <Grid gutter="md" mb="md" align="stretch">
      <Grid.Col span={leftSpan} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <InfoGrid fields={fieldsLeft} span={leftSpan} />
      </Grid.Col>
      <Grid.Col span={rightSpan} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <InfoGrid fields={fieldsRight} span={rightSpan} />
      </Grid.Col>
    </Grid>
  </Box>
);
