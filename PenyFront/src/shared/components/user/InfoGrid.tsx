import React from "react";
import { Grid } from "@mantine/core";
import { InfoField } from "./InfoField";

interface InfoGridProps {
  fields: Array<{
    label: string;
    value: React.ReactNode;
    mt?: string | number;
  }>;
  span?: number;
}

export const InfoGrid: React.FC<InfoGridProps> = ({ fields, span = 6 }) => (
  <Grid.Col span={span}>
    {fields.map((field, idx) => (
      <InfoField key={idx} label={field.label} value={field.value} mt={field.mt} />
    ))}
  </Grid.Col>
);
