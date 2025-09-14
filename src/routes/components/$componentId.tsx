import { useEffect, useState } from 'react';
import { ComponentStaticSpecs } from '@shared/components';
import { Button, Group, Paper, Select, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { getComponent, getComponents, saveComponent } from '@/api/componentApi';
import { getVariables } from '@/api/variablesApi';
import { EditorPageTemplate } from '@/components';
import { ComponentCanvas } from '@/components/canvas/ComponentCanvas';
import { ColorVariableSelector } from '@/components/VariableSelectors/ColorVariableSelector';
import PendingComponent from '@/components/PendingComponent/PendingComponent';

export const Route = createFileRoute('/components/$componentId')({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  loader: ({ params }) => {
    const componentId = parseInt(params.componentId, 10);
    return getComponent(componentId);
  },
});

function RouteComponent() {
  const loadedComponent = Route.useLoaderData();

  const [component, setComponent] = useState<ComponentStaticSpecs>(loadedComponent);

  const variables = useQuery({
    queryKey: ['variables'],
    queryFn: getVariables,
  });

  const allComponents = useQuery({
    queryKey: ['components'],
    queryFn: getComponents,
  });

  useEffect(() => {
    setComponent(loadedComponent);
  }, [loadedComponent]);

  const save = useMutation({
    mutationFn: saveComponent,
  });

  const onComponentChange = (updatedComponent: ComponentStaticSpecs) => {
    setComponent(updatedComponent);
    // Auto-save on changes
    save.mutate(updatedComponent);
  };

  const handleSave = async () => {
    // Manual save via save button
    await save.mutateAsync(component);
  };

  const addChoice = () => {
    const newChoice = {
      id: Math.max(0, ...component.choices.map((c) => c.id)) + 1,
      name: `Choice ${component.choices.length + 1}`,
      // Colors are now optional
    };

    onComponentChange({
      ...component,
      choices: [...component.choices, newChoice],
    });
  };

  const updateChoice = (choiceId: number, updates: Partial<(typeof component.choices)[0]>) => {
    onComponentChange({
      ...component,
      choices: component.choices.map((choice) =>
        choice.id === choiceId ? { ...choice, ...updates } : choice
      ),
    });
  };

  const removeChoice = (choiceId: number) => {
    onComponentChange({
      ...component,
      choices: component.choices.filter((choice) => choice.id !== choiceId),
    });
  };

  // Shape options for dropdowns
  const shapeOptions =
    variables.data?.shapes.map((shape) => ({
      value: shape.id!.toString(),
      label: `${shape.name} (${shape.type})`,
    })) || [];

  return (
    <EditorPageTemplate
      title="Component Editor"
      loading={variables.isLoading || allComponents.isLoading}
      canvasElement={(_width, _height) => (
        <ComponentCanvas
          component={component}
          variables={variables.data!}
          otherComponents={allComponents.data!}
        />
      )}
      onSave={handleSave}
      isSaving={save.isPending}
      showEditLock={false}
      sections={[
        {
          title: 'Basic Information',
          content: (
            <Stack gap="md">
              <TextInput
                label="Name"
                value={component.name}
                onChange={(e) =>
                  onComponentChange({
                    ...component,
                    name: e.target.value,
                  })
                }
              />

              <Textarea
                label="Description"
                value={component.description || ''}
                onChange={(e) =>
                  onComponentChange({
                    ...component,
                    description: e.target.value,
                  })
                }
                rows={3}
              />

              <Select
                label="Base Shape"
                value={component.shapeId.toString()}
                data={shapeOptions}
                onChange={(value) =>
                  value &&
                  onComponentChange({
                    ...component,
                    shapeId: parseInt(value, 10),
                  })
                }
              />

              <Group grow>
                <TextInput
                  label="Width"
                  type="number"
                  min={1}
                  value={component.width?.toString() || ''}
                  onChange={(e) =>
                    onComponentChange({
                      ...component,
                      width: parseInt(e.target.value, 10) || 50,
                    })
                  }
                />

                <TextInput
                  label="Height"
                  type="number"
                  min={1}
                  value={component.height?.toString() || ''}
                  onChange={(e) =>
                    onComponentChange({
                      ...component,
                      height: parseInt(e.target.value, 10) || 50,
                    })
                  }
                />
              </Group>
            </Stack>
          ),
        },
        {
          title: 'Choices',
          content: (
            <Stack gap="sm">
              <Group justify="space-between">
                <Text fw={500}>Component Choices</Text>
                <Button size="xs" leftSection={<IconPlus size={14} />} onClick={addChoice}>
                  Add Choice
                </Button>
              </Group>

              {component.choices.map((choice) => (
                <Paper key={choice.id} p="xs" withBorder>
                  <Stack gap="xs">
                    <Group justify="space-between">
                      <Text fw={500} size="sm">
                        Choice {choice.id}
                      </Text>
                      <Button
                        size="xs"
                        color="red"
                        variant="subtle"
                        onClick={() => removeChoice(choice.id)}
                      >
                        <IconTrash size={14} />
                      </Button>
                    </Group>

                    <TextInput
                      label="Name"
                      value={choice.name}
                      onChange={(e) => updateChoice(choice.id, { name: e.target.value })}
                      size="xs"
                    />

                    <Group gap="xs" align="end">
                      <div style={{ flex: 1 }}>
                        <ColorVariableSelector
                          label="Fill"
                          value={choice.fillColorId || null}
                          onChange={(value) => updateChoice(choice.id, { fillColorId: value || undefined })}
                          size="xs"
                          clearable
                          placeholder="No fill"
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <ColorVariableSelector
                          label="Stroke"
                          value={choice.strokeColorId || null}
                          onChange={(value) => updateChoice(choice.id, { strokeColorId: value || undefined })}
                          size="xs"
                          clearable
                          placeholder="No stroke"
                        />
                      </div>
                    </Group>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          ),
        },
      ]}
    />
  );
}
