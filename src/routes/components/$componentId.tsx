import { useEffect, useState } from 'react';
import { ComponentStaticSpecs } from '@shared/components';
import {
  Box,
  Button,
  Flex,
  Group,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconDeviceFloppy, IconPlus, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { getComponent, saveComponent } from '@/api/componentApi';
import { getGlobalVariables } from '@/api/globalApi';
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
  const { ref, width, height } = useElementSize();
  const [editLocked, setEditLocked] = useState(true);
  const loadedComponent = Route.useLoaderData();

  const [component, setComponent] = useState<ComponentStaticSpecs>(loadedComponent);

  const globalVars = useQuery({
    queryKey: ['globalVariables'],
    queryFn: getGlobalVariables,
  });

  useEffect(() => {
    setComponent(loadedComponent);
  }, [loadedComponent]);

  const save = useMutation({
    mutationFn: saveComponent,
  });

  const onComponentChange = (updatedComponent: ComponentStaticSpecs) => {
    setComponent(updatedComponent);
    save.mutate(updatedComponent);
  };

  const addChoice = () => {
    const newChoice = {
      id: Math.max(0, ...component.choices.map((c) => c.id)) + 1,
      name: `Choice ${component.choices.length + 1}`,
      description: '',
      fillColorId: 1,
      strokeColorId: 1,
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
  const colorOptions =
    globalVars.data?.colors.map((color) => ({
      value: color.id!.toString(),
      label: color.name,
      color: color.value,
    })) || [];

  const shapeOptions =
    globalVars.data?.shapes.map((shape) => ({
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
          backgroundColor: option.color,
          border: '1px solid #ccc',
          borderRadius: 3,
        }}
      />
      <Text size="sm">{option.label}</Text>
      <Text size="xs" c="dimmed">
        ({option.color})
      </Text>
    </Group>
  );

  return (
    <Flex style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Box
        style={{
          width: '350px',
          height: '100%',
          flexShrink: 0,
          overflow: 'auto',
          borderRight: '1px solid #dee2e6',
          backgroundColor: '#f8f9fa',
        }}
      >
        <Stack gap="md" p="md">
          <Group justify="space-between">
            <Title order={3}>Component Editor</Title>
            <Switch
              label="Lock Edit"
              checked={editLocked}
              onChange={(event) => setEditLocked(event.currentTarget.checked)}
            />
          </Group>

          <Paper p="md" withBorder>
            <Stack gap="md">
              <Title order={4}>Basic Information</Title>

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
            </Stack>
          </Paper>

          <Paper p="md" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={4}>Choices</Title>
                <Button size="xs" leftSection={<IconPlus size={14} />} onClick={addChoice}>
                  Add Choice
                </Button>
              </Group>

              {component.choices.map((choice) => (
                <Paper key={choice.id} p="sm" withBorder>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text fw={500}>Choice {choice.id}</Text>
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
                      size="sm"
                    />

                    <Textarea
                      label="Description"
                      value={choice.description || ''}
                      onChange={(e) => updateChoice(choice.id, { description: e.target.value })}
                      rows={2}
                      size="sm"
                    />

                    <Select
                      label="Fill Color"
                      value={choice.fillColorId.toString()}
                      data={colorOptions}
                      renderOption={renderColorSelectOption}
                      onChange={(value) =>
                        value &&
                        updateChoice(choice.id, {
                          fillColorId: parseInt(value, 10),
                        })
                      }
                      size="sm"
                    />

                    <Select
                      label="Stroke Color"
                      value={choice.strokeColorId.toString()}
                      data={colorOptions}
                      renderOption={renderColorSelectOption}
                      onChange={(value) =>
                        value &&
                        updateChoice(choice.id, {
                          strokeColorId: parseInt(value, 10),
                        })
                      }
                      size="sm"
                    />
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Paper>

          <Button
            leftSection={<IconDeviceFloppy />}
            loading={save.isPending}
            onClick={() => save.mutate(component)}
          >
            Save Component
          </Button>
        </Stack>
      </Box>

      <Box ref={ref} style={{ flex: 1, height: '100%' }}>
        {/* Canvas will go here - for now just a placeholder */}
        <Flex align="center" justify="center" h="100%" bg="#f8f9fa">
          <Stack align="center" gap="md">
            <Title order={2} c="dimmed">
              Component Canvas
            </Title>
            <Text c="dimmed">Canvas preview will be implemented here</Text>
            <Text size="sm" c="dimmed">
              Dimensions: {width} x {height}
            </Text>
          </Stack>
        </Flex>
      </Box>
    </Flex>
  );
}
