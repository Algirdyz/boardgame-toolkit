import { Button, Group, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { IconPalette, IconPlus, IconRuler, IconShape, IconTag } from '@tabler/icons-react';
import { VariableListProps } from './types';
import { VariableCard } from './VariableCard';

export function VariableList({ type, variables, onAdd, onEdit, onDelete }: VariableListProps) {
  const getIcon = () => {
    switch (type) {
      case 'colors':
        return <IconPalette size={16} />;
      case 'shapes':
        return <IconShape size={16} />;
      case 'dimensions':
        return <IconRuler size={16} />;
      case 'names':
        return <IconTag size={16} />;
    }
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Group gap="xs">
          {getIcon()}
          <Title order={3} style={{ textTransform: 'capitalize' }}>
            {type}
          </Title>
        </Group>
        <Button leftSection={<IconPlus size={16} />} size="sm" onClick={() => onAdd(type)}>
          Add {type.slice(0, -1)}
        </Button>
      </Group>

      {variables.length === 0 ? (
        <Paper p="xl" withBorder>
          <Text c="dimmed" ta="center">
            No {type} defined yet. Click "Add {type.slice(0, -1)}" to get started.
          </Text>
        </Paper>
      ) : (
        <SimpleGrid
          cols={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }}
          spacing="md"
          verticalSpacing="md"
        >
          {variables.map((variable) => (
            <VariableCard
              key={variable.id}
              variable={variable}
              type={type}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
