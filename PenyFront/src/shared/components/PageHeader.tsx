import { Group, Text, Title } from "@mantine/core";


interface PageHeaderProps {
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
}

export function PageHeader({ title, subtitle, icon }: PageHeaderProps) {
    return (
       <div>
        <Group gap="sm" align="center">
          {icon}
          <div>
            <Title order={1} size="h2">
              {title}
            </Title>
            {subtitle && (
              <Text c="dimmed" size="sm">
                {subtitle}
              </Text>
            )}
          </div>
        </Group>
      </div>
    );
}