import { ComponentStaticSpecs, ComponentTemplateSpecs } from '@shared/components';
import { TemplateDefinition } from '@shared/templates';
import { Button, Center, Group, Loader, NumberInput, Select, Stack, Text } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { generateComponentInstances } from '@/lib/componentInstanceUtils';

interface TemplateComponentsManagerProps {
  template: TemplateDefinition;
  onTemplateChange: (template: TemplateDefinition) => void;
  availableComponents: ComponentStaticSpecs[];
  onAddComponent: (componentId: number) => void;
  onUpdateComponentSpecs: (instanceId: string, updates: Partial<ComponentTemplateSpecs>) => void;
  onRemoveComponent: (instanceId: string) => void;
}

export function TemplateComponentsManager({
  template,
  availableComponents,
  onAddComponent,
  onUpdateComponentSpecs,
  onRemoveComponent,
}: TemplateComponentsManagerProps) {
  // Simple loading check
  if (!availableComponents.length) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  // Available components for dropdown
  const componentOptions = availableComponents.map((comp) => ({
    value: comp.id!.toString(),
    label: comp.name,
  }));

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Text size="sm" fw={500}>
          Template Components ({Object.keys(template.components).length})
        </Text>
        <Select
          placeholder="Add component..."
          data={componentOptions}
          onChange={(value) => {
            if (value) {
              onAddComponent(parseInt(value, 10));
            }
          }}
          searchable
          value={null}
          leftSection={<IconPlus size={16} />}
          size="xs"
        />
      </Group>

      {Object.entries(template.components).map(([instanceId, instance]) => {
        const component = availableComponents.find((c) => c.id === instance.componentId);
        if (!component) {
          return (
            <Stack
              key={instanceId}
              gap="xs"
              p="md"
              style={{
                backgroundColor: '#fff5f5',
                border: '1px solid #fecaca',
                borderRadius: '8px',
              }}
            >
              <Group justify="space-between">
                <Text size="sm" c="red" fw={500}>
                  ⚠️ Component #{instance.componentId} not found
                </Text>
                <Button
                  size="xs"
                  color="red"
                  variant="subtle"
                  onClick={() => onRemoveComponent(instanceId)}
                  leftSection={<IconTrash size={14} />}
                >
                  Remove
                </Button>
              </Group>
              <Text size="xs" c="dimmed">
                This component may have been deleted. Click "Remove" to clean up.
              </Text>
            </Stack>
          );
        }
        const componentSize = { width: component.width, height: component.height };
        const instances = generateComponentInstances(
          instanceId,
          componentSize,
          instance.templateSpecs
        );
        const componentsPerRow = Math.ceil(
          instance.templateSpecs.maxCount / instance.templateSpecs.rows
        );

        return (
          <Stack
            key={instanceId}
            gap="xs"
            p="sm"
            style={{
              border: '1px solid #dee2e6',
              borderRadius: 4,
              backgroundColor: '#f8f9fa',
            }}
          >
            <Group justify="space-between">
              <Text size="sm" fw={500}>
                {component?.name || 'Unknown Component'}
                <Text size="xs" c="dimmed" span ml={8}>
                  ({instances.length} instance{instances.length !== 1 ? 's' : ''})
                </Text>
              </Text>
              <Button
                size="xs"
                variant="subtle"
                color="red"
                onClick={() => onRemoveComponent(instanceId)}
                title="Remove component"
              >
                <IconTrash size={14} />
              </Button>
            </Group>

            <Group grow>
              <NumberInput
                label="Max Count"
                value={instance.templateSpecs.maxCount}
                onChange={(value) =>
                  onUpdateComponentSpecs(instanceId, { maxCount: Number(value) || 1 })
                }
                min={1}
                size="xs"
              />

              <NumberInput
                label="Rows"
                value={instance.templateSpecs.rows}
                onChange={(value) =>
                  onUpdateComponentSpecs(instanceId, { rows: Number(value) || 1 })
                }
                min={1}
                max={instance.templateSpecs.maxCount}
                size="xs"
              />
            </Group>

            <NumberInput
              label="Spacing"
              value={instance.templateSpecs.spacing}
              onChange={(value) =>
                onUpdateComponentSpecs(instanceId, { spacing: Number(value) || 0 })
              }
              min={0}
              size="xs"
            />

            <Text size="xs" c="dimmed">
              Layout: {componentsPerRow} per row • Position: (
              {instance.templateSpecs.position.x.toFixed(1)},{' '}
              {instance.templateSpecs.position.y.toFixed(1)}) • Rotation:{' '}
              {instance.templateSpecs.position.rotation}° • Scale:{' '}
              {(instance.templateSpecs.position.scale * 100).toFixed(0)}%
            </Text>
          </Stack>
        );
      })}

      {Object.keys(template.components).length === 0 && (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          No components added yet. Use the dropdown above to add components.
        </Text>
      )}
    </Stack>
  );
}
