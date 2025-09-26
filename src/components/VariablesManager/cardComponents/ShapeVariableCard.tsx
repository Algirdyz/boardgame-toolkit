import { VariableShape } from '@shared/variables';
import { ActionIcon, Badge, Group, Paper, Stack, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { ShapePreview } from '../modals/ShapePreview';
import { VariableListItemProps } from '../variableTypeConfig';

export function ShapeVariableCard({ variable, type, onEdit, onDelete }: VariableListItemProps) {
  const shapeVar = variable as VariableShape;

  return (
    <Paper p="sm" withBorder style={{ height: '100%' }}>
      <Stack gap="xs" align="center">
        <div style={{ width: 50, height: 50, flexShrink: 0 }}>
          <ShapePreview shape={shapeVar} width={50} height={50} />
        </div>
        <Text size="sm" fw={500} ta="center" lineClamp={1}>
          {variable.name}
        </Text>
        <Badge variant="light" size="xs">
          {shapeVar.type}
        </Badge>
        <Text size="xs" c="dimmed" ta="center" lineClamp={1}>
          {shapeVar.value}
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
