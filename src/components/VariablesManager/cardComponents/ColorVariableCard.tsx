import { VariableColor } from '@shared/variables';
import { ActionIcon, Group, Paper, Stack, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { VariableListItemProps } from '../variableTypeConfig';

export function ColorVariableCard({ variable, type, onEdit, onDelete }: VariableListItemProps) {
  const colorVar = variable as VariableColor;

  return (
    <Paper p="sm" withBorder style={{ height: '100%' }}>
      <Stack gap="xs" align="center">
        <div
          style={{
            width: 40,
            height: 40,
            backgroundColor: colorVar.value,
            border: '1px solid #ddd',
            borderRadius: 8,
            flexShrink: 0,
          }}
        />
        <Text size="sm" fw={500} ta="center" lineClamp={1}>
          {variable.name}
        </Text>
        <Text size="xs" c="dimmed" ta="center" lineClamp={1}>
          {colorVar.value}
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
