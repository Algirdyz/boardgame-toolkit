import { Button, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { VariableListProps } from './types';
import { variableTypeRegistry } from './variableTypeRegistry';

export function VariableList({ type, variables, onAdd, onEdit, onDelete }: VariableListProps) {
  const config = variableTypeRegistry.getConfig(type);
  const IconComponent = config.icon;
  const CardComponent = config.listItemComponent;
  console.log('Rendering VariableList for type:', type);
  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group gap="xs">
          <IconComponent size={16} />
          <Title order={3}>{config.pluralName}</Title>
        </Group>
        <Button leftSection={<IconPlus size={16} />} size="sm" onClick={() => onAdd(type)}>
          Add {config.name}
        </Button>
      </Group>

      {variables.length === 0 ? (
        <Paper p="xl" withBorder>
          <Text c="dimmed" ta="center">
            No {config.pluralName.toLowerCase()} defined yet. Click "Add {config.name}" to get
            started.
          </Text>
        </Paper>
      ) : (
        <SimpleGrid
          cols={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
          spacing="md"
          verticalSpacing="md"
        >
          {variables.map((variable) => {
            return (
              <CardComponent
                key={variable.id}
                variable={variable}
                type={type}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            );
          })}
        </SimpleGrid>
      )}
    </Stack>
  );
}
