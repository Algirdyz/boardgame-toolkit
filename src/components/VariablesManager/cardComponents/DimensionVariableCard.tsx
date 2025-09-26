import { VariableDimension } from '@shared/variables';
import { ActionIcon, Group, Paper, Stack, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconRuler, IconTrash } from '@tabler/icons-react';
import { VariableListItemProps } from '../variableTypeConfig';

export function DimensionVariableCard({ variable, type, onEdit, onDelete }: VariableListItemProps) {
  const dimVar = variable as VariableDimension;

  return (
    <Paper p="sm" withBorder style={{ height: '100%' }}>
      <Stack gap="xs" align="center">
        <div
          style={{
            width: 40,
            height: 40,
            backgroundColor: '#f8f9fa',
            border: '1px solid #ddd',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <IconRuler size={20} color="#666" />
        </div>
        <Text size="sm" fw={500} ta="center" lineClamp={1}>
          {variable.name}
        </Text>
        <Text size="sm" ta="center" c="blue">
          {dimVar.value} {dimVar.unit}
        </Text>
        {variable.description && (
          <Tooltip label={variable.description}>
            <Text size="xs" c="dimmed" ta="center" lineClamp={2}>
              {variable.description}
            </Text>
          </Tooltip>
        )}
        <Group gap="xs" justify="center">
          <ActionIcon
            variant="subtle"
            color="blue"
            size="sm"
            onClick={() => onEdit(type, variable)}
          >
            <IconEdit size={12} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            size="sm"
            onClick={() => onDelete(type, variable.id!)}
          >
            <IconTrash size={12} />
          </ActionIcon>
        </Group>
      </Stack>
    </Paper>
  );
}
