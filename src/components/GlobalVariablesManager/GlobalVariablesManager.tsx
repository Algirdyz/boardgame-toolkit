import { useState } from 'react';
import { GlobalVariable, GlobalVariableType } from '@shared/globals';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Center,
  Container,
  Group,
  Loader,
  Paper,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconEdit,
  IconPalette,
  IconPlus,
  IconRuler,
  IconShape,
  IconTag,
  IconTrash,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteGlobalVariable, getGlobalVariables, saveGlobalVariable } from '../../api/globalApi';
import { ColorVariableModal } from './modals/ColorVariableModal';
import { DimensionVariableModal } from './modals/DimensionVariableModal';
import { NameVariableModal } from './modals/NameVariableModal';
import { ShapeVariableModal } from './modals/ShapeVariableModal';

export function GlobalVariablesManager() {
  const queryClient = useQueryClient();
  const [editingVariable, setEditingVariable] = useState<GlobalVariable | null>(null);
  const [editingType, setEditingType] = useState<GlobalVariableType | null>(null);
  const [activeTab, setActiveTab] = useState<string>('colors');

  const [colorModalOpened, { open: openColorModal, close: closeColorModal }] = useDisclosure(false);
  const [shapeModalOpened, { open: openShapeModal, close: closeShapeModal }] = useDisclosure(false);
  const [dimensionModalOpened, { open: openDimensionModal, close: closeDimensionModal }] =
    useDisclosure(false);
  const [nameModalOpened, { open: openNameModal, close: closeNameModal }] = useDisclosure(false);

  // TanStack Query hooks
  const globals = useQuery({
    queryKey: ['globals'],
    queryFn: getGlobalVariables,
  });

  const saveMutation = useMutation({
    mutationFn: ({ type, variable }: { type: GlobalVariableType; variable: GlobalVariable }) =>
      saveGlobalVariable(type, variable),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globals'] });
      notifications.show({
        title: 'Success',
        message: `Variable ${editingVariable ? 'updated' : 'created'} successfully`,
        color: 'green',
      });
      handleModalClose();
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to save variable',
        color: 'red',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGlobalVariable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globals'] });
      notifications.show({
        title: 'Success',
        message: 'Variable deleted successfully',
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete variable',
        color: 'red',
      });
    },
  });

  const handleAdd = (type: GlobalVariableType) => {
    setEditingVariable(null);
    setEditingType(type);

    switch (type) {
      case 'colors':
        openColorModal();
        break;
      case 'shapes':
        openShapeModal();
        break;
      case 'dimensions':
        openDimensionModal();
        break;
      case 'names':
        openNameModal();
        break;
    }
  };

  const handleEdit = (type: GlobalVariableType, variable: GlobalVariable) => {
    setEditingVariable(variable);
    setEditingType(type);

    switch (type) {
      case 'colors':
        openColorModal();
        break;
      case 'shapes':
        openShapeModal();
        break;
      case 'dimensions':
        openDimensionModal();
        break;
      case 'names':
        openNameModal();
        break;
    }
  };

  const handleDelete = (_type: GlobalVariableType, id: number) => {
    deleteMutation.mutate(id);
  };

  const handleModalClose = () => {
    setEditingVariable(null);
    setEditingType(null);
    closeColorModal();
    closeShapeModal();
    closeDimensionModal();
    closeNameModal();
  };

  const handleSave = (type: GlobalVariableType, variable: GlobalVariable) => {
    saveMutation.mutate({ type, variable });
  };

  const renderVariableList = (type: GlobalVariableType, variables: GlobalVariable[]) => {
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

    const getDisplayValue = (variable: GlobalVariable) => {
      switch (type) {
        case 'colors': {
          return (
            <Group gap="xs">
              <div
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: (variable as any).value,
                  border: '1px solid #ccc',
                  borderRadius: 4,
                }}
              />
              <Text size="sm">{(variable as any).value}</Text>
            </Group>
          );
        }
        case 'shapes': {
          const shape = variable as any;
          return (
            <Badge variant="light">
              {shape.type}: {shape.value}
            </Badge>
          );
        }
        case 'dimensions': {
          const dim = variable as any;
          return (
            <Text size="sm">
              {dim.value} {dim.unit}
            </Text>
          );
        }
        case 'names': {
          return <Text size="sm">{(variable as any).value}</Text>;
        }
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
          <Button leftSection={<IconPlus size={16} />} size="sm" onClick={() => handleAdd(type)}>
            Add {type.slice(0, -1)}
          </Button>
        </Group>

        {variables.length === 0 ? (
          <Paper p="md" withBorder>
            <Text c="dimmed" ta="center">
              No {type} defined yet. Click "Add {type.slice(0, -1)}" to get started.
            </Text>
          </Paper>
        ) : (
          variables.map((variable) => (
            <Paper key={variable.id} p="md" withBorder>
              <Group justify="space-between">
                <Stack gap="xs" style={{ flex: 1 }}>
                  <Group justify="space-between">
                    <Text fw={500}>{variable.name}</Text>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => handleEdit(type, variable)}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(type, variable.id!)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                  {getDisplayValue(variable)}
                  {variable.description && (
                    <Text size="sm" c="dimmed">
                      {variable.description}
                    </Text>
                  )}
                </Stack>
              </Group>
            </Paper>
          ))
        )}
      </Stack>
    );
  };

  if (globals.isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  if (globals.isError) {
    return (
      <Container size="lg" py="xl">
        <Alert color="red" title="Error">
          Error loading global variables
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>Global Variables</Title>
          <Text c="dimmed" mt="xs">
            Define reusable variables for colors, shapes, dimensions, and names that can be used
            throughout your project.
          </Text>
        </div>

        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'colors')}>
          <Tabs.List>
            <Tabs.Tab value="colors" leftSection={<IconPalette size={16} />}>
              Colors
            </Tabs.Tab>
            <Tabs.Tab value="shapes" leftSection={<IconShape size={16} />}>
              Shapes
            </Tabs.Tab>
            <Tabs.Tab value="dimensions" leftSection={<IconRuler size={16} />}>
              Dimensions
            </Tabs.Tab>
            <Tabs.Tab value="names" leftSection={<IconTag size={16} />}>
              Names
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="colors" pt="xl">
            {renderVariableList('colors', globals.data?.colors || [])}
          </Tabs.Panel>

          <Tabs.Panel value="shapes" pt="xl">
            {renderVariableList('shapes', globals.data?.shapes || [])}
          </Tabs.Panel>

          <Tabs.Panel value="dimensions" pt="xl">
            {renderVariableList('dimensions', globals.data?.dimensions || [])}
          </Tabs.Panel>

          <Tabs.Panel value="names" pt="xl">
            {renderVariableList('names', globals.data?.names || [])}
          </Tabs.Panel>
        </Tabs>
      </Stack>

      {/* Modals */}
      <ColorVariableModal
        opened={colorModalOpened}
        onClose={handleModalClose}
        variable={editingType === 'colors' ? (editingVariable as any) : null}
        onSave={(variable) => handleSave('colors', variable)}
      />

      <ShapeVariableModal
        opened={shapeModalOpened}
        onClose={handleModalClose}
        variable={editingType === 'shapes' ? (editingVariable as any) : null}
        onSave={(variable) => handleSave('shapes', variable)}
      />

      <DimensionVariableModal
        opened={dimensionModalOpened}
        onClose={handleModalClose}
        variable={editingType === 'dimensions' ? (editingVariable as any) : null}
        onSave={(variable) => handleSave('dimensions', variable)}
      />

      <NameVariableModal
        opened={nameModalOpened}
        onClose={handleModalClose}
        variable={editingType === 'names' ? (editingVariable as any) : null}
        onSave={(variable) => handleSave('names', variable)}
      />
    </Container>
  );
}
