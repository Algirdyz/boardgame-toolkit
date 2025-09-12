import { useState } from 'react';
import { Variable, VariableType } from '@shared/variables';
import { Alert, Center, Container, Loader, Stack, Tabs, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPalette, IconRuler, IconShape, IconTag } from '@tabler/icons-react';
import { useNavigate, useParams } from '@tanstack/react-router';
import { useVariablesManager } from './useVariablesManager';
import { VariableList } from './VariableList';
import { VariableModalManager } from './VariableModalManager';

export function VariablesManager() {
  const [editingVariable, setEditingVariable] = useState<Variable | null>(null);
  const [editingType, setEditingType] = useState<VariableType | null>(null);

  const navigate = useNavigate();
  const params = useParams({ strict: false });

  // Get the current tab from URL params, default to 'colors'
  const currentTab = (params as any)?.variableType || 'colors';

  // Validate that the tab is a valid variable type
  const validTabs = ['colors', 'shapes', 'dimensions', 'names'];
  const activeTab = validTabs.includes(currentTab) ? currentTab : 'colors';

  const [colorModalOpened, { open: openColorModal, close: closeColorModal }] = useDisclosure(false);
  const [shapeModalOpened, { open: openShapeModal, close: closeShapeModal }] = useDisclosure(false);
  const [dimensionModalOpened, { open: openDimensionModal, close: closeDimensionModal }] =
    useDisclosure(false);
  const [nameModalOpened, { open: openNameModal, close: closeNameModal }] = useDisclosure(false);

  const { variables, saveMutation, deleteMutation } = useVariablesManager();

  // Handle tab changes by navigating to the appropriate URL
  const handleTabChange = (value: string | null) => {
    if (value && validTabs.includes(value)) {
      navigate({
        to: '/variables/$variableType',
        params: { variableType: value },
      });
    }
  };

  const handleAdd = (type: VariableType) => {
    setEditingVariable(null);
    setEditingType(type);
    openModalForType(type);
  };

  const handleEdit = (type: VariableType, variable: Variable) => {
    setEditingVariable(variable);
    setEditingType(type);
    openModalForType(type);
  };

  const handleDelete = (_type: VariableType, id: number) => {
    deleteMutation.mutate(id);
  };

  const openModalForType = (type: VariableType) => {
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

  const handleModalClose = () => {
    setEditingVariable(null);
    setEditingType(null);
    closeColorModal();
    closeShapeModal();
    closeDimensionModal();
    closeNameModal();
  };

  const handleSave = (type: VariableType, variable: Variable) => {
    saveMutation.mutate({ type, variable });
    handleModalClose();
  };

  if (variables.isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  if (variables.isError) {
    return (
      <Container size="lg" py="xl">
        <Alert color="red" title="Error">
          Error loading variables
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>Variables</Title>
          <Text c="dimmed" mt="xs">
            Define reusable variables for colors, shapes, dimensions, and names that can be used
            throughout your project.
          </Text>
        </div>

        <Tabs value={activeTab} onChange={handleTabChange}>
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
            <VariableList
              type="colors"
              variables={variables.data?.colors || []}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Tabs.Panel>

          <Tabs.Panel value="shapes" pt="xl">
            <VariableList
              type="shapes"
              variables={variables.data?.shapes || []}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Tabs.Panel>

          <Tabs.Panel value="dimensions" pt="xl">
            <VariableList
              type="dimensions"
              variables={variables.data?.dimensions || []}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Tabs.Panel>

          <Tabs.Panel value="names" pt="xl">
            <VariableList
              type="names"
              variables={variables.data?.names || []}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Tabs.Panel>
        </Tabs>

        <VariableModalManager
          editingVariable={editingVariable}
          editingType={editingType}
          colorModalOpened={colorModalOpened}
          shapeModalOpened={shapeModalOpened}
          dimensionModalOpened={dimensionModalOpened}
          nameModalOpened={nameModalOpened}
          onModalClose={handleModalClose}
          onSave={handleSave}
        />
      </Stack>
    </Container>
  );
}
