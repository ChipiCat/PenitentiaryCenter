import { Group } from "@mantine/core";
import type { ReactNode } from "react";

export const InputGroup = ({ children }: { children: ReactNode }) => (
  <Group grow>{children}</Group>
);
