import { useEffect, useState } from 'react';
import { ComponentTemplateSpecs } from '@shared/components';
import { TemplateDefinition } from '@shared/templates';
import { Button, Group, NumberInput, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { getComponents } from '@/api/componentApi';
import { getTemplate, saveTemplate } from '@/api/templateApi';
import { EditorPageTemplate } from '@/components';
import TemplateCanvas from '@/components/canvas/TemplateCanvas';
import PendingComponent from '@/components/PendingComponent/PendingComponent';

export const Route = createFileRoute('/templates/$templateId')({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  loader: ({ params }) => {
    const templateId = parseInt(params.templateId, 10);
    return getTemplate(templateId);
  },
});

function RouteComponent() {
  const [editLocked, setEditLocked] = useState(true);
  const loadedTemplate = Route.useLoaderData();

  const [template, setTemplate] = useState<TemplateDefinition>(loadedTemplate);
  useEffect(() => {
    setTemplate(loadedTemplate);
  }, [loadedTemplate]);

  // Load available components
  const components = useQuery({
    queryKey: ['components'],
    queryFn: getComponents,
  });

  const save = useMutation({
    mutationFn: saveTemplate,
  });

  const onTemplateChange = (updatedTemplate: TemplateDefinition) => {
    // This is the source of truth for the editor's current state.
    setTemplate(updatedTemplate);
    save.mutate(updatedTemplate);
  };

  // Component management functions
  const addComponent = (componentId: number) => {
    const newInstanceId = `instance_${Date.now()}_${Math.random()}`;
    const defaultTemplateSpecs: ComponentTemplateSpecs = {
      position: { x: 50, y: 50, rotation: 0, scale: 1 },
      maxCount: 1,
      rows: 1,
      spacing: 10,
    };

    onTemplateChange({
      ...template,
      components: {
        ...template.components,
        [newInstanceId]: {
          componentId,
          templateSpecs: defaultTemplateSpecs,
        },
      },
    });
  };

  const updateComponentTemplateSpecs = (
    instanceId: string,
    updates: Partial<ComponentTemplateSpecs>
  ) => {
    const instance = template.components[instanceId];
    if (!instance) return;

    onTemplateChange({
      ...template,
      components: {
        ...template.components,
        [instanceId]: {
          ...instance,
          templateSpecs: {
            ...instance.templateSpecs,
            ...updates,
          },
        },
      },
    });
  };

  const removeComponent = (instanceId: string) => {
    const { [instanceId]: removed, ...remainingComponents } = template.components;
    onTemplateChange({
      ...template,
      components: remainingComponents,
    });
  };

  // Available components for dropdown
  const componentOptions =
    components.data?.map((comp) => ({
      value: comp.id!.toString(),
      label: comp.name,
    })) || [];

  const templateSections = [
    {
      title: 'Basic Information',
      content: (
        <TextInput
          label="Template Name"
          value={template.name}
          onChange={(e) =>
            onTemplateChange({
              ...template,
              name: e.target.value,
            })
          }
        />
      ),
    },
    {
      title: 'Components',
      content: (
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
                  addComponent(parseInt(value, 10));
                }
              }}
              searchable
              value={null}
              leftSection={<IconPlus size={16} />}
              size="xs"
            />
          </Group>

          {Object.entries(template.components).map(([instanceId, instance]) => {
            const component = components.data?.find((c) => c.id === instance.componentId);
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
                  </Text>
                  <Button
                    size="xs"
                    variant="subtle"
                    color="red"
                    onClick={() => removeComponent(instanceId)}
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
                      updateComponentTemplateSpecs(instanceId, { maxCount: Number(value) || 1 })
                    }
                    min={1}
                    size="xs"
                  />

                  <NumberInput
                    label="Rows"
                    value={instance.templateSpecs.rows}
                    onChange={(value) =>
                      updateComponentTemplateSpecs(instanceId, { rows: Number(value) || 1 })
                    }
                    min={1}
                    size="xs"
                  />
                </Group>

                <NumberInput
                  label="Spacing"
                  value={instance.templateSpecs.spacing}
                  onChange={(value) =>
                    updateComponentTemplateSpecs(instanceId, { spacing: Number(value) || 0 })
                  }
                  min={0}
                  size="xs"
                />

                <Text size="xs" c="dimmed">
                  Position: ({instance.templateSpecs.position.x.toFixed(1)},{' '}
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
      ),
    },
  ];

  return (
    <EditorPageTemplate
      title="Template Editor"
      canvasElement={(width, height) => (
        <TemplateCanvas
          template={template}
          onTemplateChange={onTemplateChange}
          width={width}
          height={height}
          editLocked={editLocked}
        />
      )}
      onSave={() => save.mutate(template)}
      isSaving={save.isPending}
      editLocked={!editLocked}
      onEditLockChange={(locked) => setEditLocked(!locked)}
      editLockLabel="Edit Shape"
      sections={templateSections}
    />
  );
}
