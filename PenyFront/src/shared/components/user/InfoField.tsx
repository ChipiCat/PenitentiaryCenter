import React from "react";
import { Text } from "@mantine/core";

interface InfoFieldProps {
  label: string;
  value: React.ReactNode;
  mt?: string | number;
}

export const InfoField: React.FC<InfoFieldProps> = ({ label, value, mt }) => (
  <>
    <Text size="sm" c="dimmed" mt={mt}>{label}</Text>
    <Text fw={500}>{value}</Text>
  </>
);
