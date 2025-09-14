import { useEffect, useState } from 'react';
import { ComponentStaticSpecs } from '@shared/components';
import {
  Button,
  Flex,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { getComponent, getComponents, saveComponent } from '@/api/componentApi';
import { getVariables } from '@/api/variablesApi';
import { EditorPageTemplate } from '@/components';
import { ComponentCanvas } from '@/components/canvas/ComponentCanvas';
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

  // Color and shape options for dropdowns
  const colorOptions = [
    { value: '', label: 'No Color', color: 'transparent' },
    ...(variables.data?.colors.map((color) => ({
      value: color.id!.toString(),
      label: color.name,
      color: color.value,
    })) || []),
  ];

  const shapeOptions =
    variables.data?.shapes.map((shape) => ({
      value: shape.id!.toString(),
      label: `${shape.name} (${shape.type})`,
    })) || [];

  // Custom render function for color options
  const renderColorSelectOption = ({ option }: { option: any }) => (
    <Group gap="sm">
      <div
        style={{
          width: 16,
          height: 16,
          backgroundColor: option.color === 'transparent' ? '#f8f9fa' : option.color,
          border: option.color === 'transparent' ? '2px dashed #ccc' : '1px solid #ccc',
          borderRadius: 3,
        }}
      />
      <Text size="sm">{option.label}</Text>
      {option.color !== 'transparent' && (
        <Text size="xs" c="dimmed">
          ({option.color})
        </Text>
      )}
    </Group>
  );

  // Helper function to get color value by ID
  const getColorById = (colorId: number | undefined) => {
    if (!colorId || !variables.data) return null;
    return variables.data.colors.find((color) => color.id === colorId);
  };

  // Helper function to render selected color preview
  const renderSelectedColorPreview = (colorId: number | undefined, label: string) => {
    const selectedColor = getColorById(colorId);
    const colorValue = selectedColor?.value || 'transparent';
    const isTransparent = !selectedColor || colorValue === 'transparent';

    return (
      <Group gap="xs" align="center" mb={2}>
        <Text size="xs" fw={500}>
          {label}
        </Text>
        <div
          style={{
            width: 16,
            height: 16,
            backgroundColor: isTransparent ? '#f8f9fa' : colorValue,
            border: isTransparent ? '2px dashed #ccc' : '1px solid #ccc',
            borderRadius: 3,
          }}
        />
        {selectedColor && (
          <Text size="xs" c="dimmed">
            {selectedColor.name}
          </Text>
        )}
      </Group>
    );
  };

  return (
    <EditorPageTemplate
      title="Component Editor"
      canvasElement={(_width, _height) =>
        variables.data && allComponents.data ? (
          <ComponentCanvas
            component={component}
            variables={variables.data}
            otherComponents={allComponents.data}
          />
        ) : (
          <Flex align="center" justify="center" h="100%" bg="#f8f9fa">
            <Stack align="center" gap="md">
              <Title order={2} c="dimmed">
                Loading Canvas...
              </Title>
              <Text c="dimmed">Waiting for variables</Text>
            </Stack>
          </Flex>
        )
      }
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
                        {renderSelectedColorPreview(choice.fillColorId, 'Fill')}
                        <Select
                          placeholder="No fill"
                          value={choice.fillColorId?.toString() || ''}
                          data={colorOptions}
                          renderOption={renderColorSelectOption}
                          clearable
                          onChange={(value) => {
                            if (value === '' || value === null) {
                              updateChoice(choice.id, { fillColorId: undefined });
                            } else {
                              updateChoice(choice.id, {
                                fillColorId: parseInt(value, 10),
                              });
                            }
                          }}
                          size="xs"
                          comboboxProps={{ dropdownPadding: 4, width: 250 }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        {renderSelectedColorPreview(choice.strokeColorId, 'Stroke')}
                        <Select
                          placeholder="No stroke"
                          value={choice.strokeColorId?.toString() || ''}
                          data={colorOptions}
                          renderOption={renderColorSelectOption}
                          clearable
                          onChange={(value) => {
                            if (value === '' || value === null) {
                              updateChoice(choice.id, { strokeColorId: undefined });
                            } else {
                              updateChoice(choice.id, {
                                strokeColorId: parseInt(value, 10),
                              });
                            }
                          }}
                          size="xs"
                          comboboxProps={{ dropdownPadding: 4, width: 250 }}
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
