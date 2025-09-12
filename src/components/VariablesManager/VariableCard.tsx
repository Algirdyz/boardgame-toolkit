import { ActionIcon, Badge, Group, Paper, Stack, Text, Tooltip } from '@mantine/core';
import { IconEdit, IconRuler, IconTag, IconTrash } from '@tabler/icons-react';
import { ShapePreview } from './modals/ShapePreview';
import { VariableCardProps } from './types';

export function VariableCard({ variable, type, onEdit, onDelete }: VariableCardProps) {
  const renderCardContent = () => {
    switch (type) {
      case 'colors': {
        return (
          <>
            <div
              style={{
                width: 40,
                height: 40,
                backgroundColor: (variable as any).value,
                border: '1px solid #ddd',
                borderRadius: 8,
                flexShrink: 0,
              }}
            />
            <Text size="sm" fw={500} ta="center" lineClamp={1}>
              {variable.name}
            </Text>
            <Text size="xs" c="dimmed" ta="center" lineClamp={1}>
              {(variable as any).value}
            </Text>
          </>
        );
      }
      case 'shapes': {
        const shape = variable as any;
        return (
          <>
            <div style={{ width: 50, height: 50, flexShrink: 0 }}>
              <ShapePreview shape={shape} width={50} height={50} />
            </div>
            <Text size="sm" fw={500} ta="center" lineClamp={1}>
              {variable.name}
            </Text>
            <Badge variant="light" size="xs">
              {shape.type}
            </Badge>
            <Text size="xs" c="dimmed" ta="center" lineClamp={1}>
              {shape.value}
            </Text>
          </>
        );
      }
      case 'dimensions': {
        const dim = variable as any;
        return (
          <>
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
              {dim.value} {dim.unit}
            </Text>
          </>
        );
      }
      case 'names': {
        return (
          <>
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
              <IconTag size={20} color="#666" />
            </div>
            <Text size="sm" fw={500} ta="center" lineClamp={1}>
              {variable.name}
            </Text>
            <Text size="sm" ta="center" c="green">
              {(variable as any).value}
            </Text>
          </>
        );
      }
    }
  };

  return (
    <Paper p="sm" withBorder style={{ height: '100%' }}>
      <Stack gap="xs" align="center">
        {renderCardContent()}
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
