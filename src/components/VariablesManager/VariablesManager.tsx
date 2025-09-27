import { useCallback, useState } from 'react';
import { Variable, VariableType } from '@shared/variables';
import { Alert, Center, Container, Loader, Stack, Tabs, Text, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate, useParams } from '@tanstack/react-router';
import { UniversalVariableModal } from './UniversalVariableModal';
import { useVariablesManager } from './useVariablesManager';
import { VariableList } from './VariableList';
import { variableTypeRegistry } from './variableTypeRegistry';

export function VariablesManager() {
  const [editingVariable, setEditingVariable] = useState<Variable | null>(null);
  const [editingType, setEditingType] = useState<VariableType | null>(null);

  const navigate = useNavigate();
  const params = useParams({ strict: false });

  // Get the current tab from URL params, default to 'colors'
  const currentTab = (params as any)?.variableType || 'colors';

  // Validate that the tab is a valid variable type using the registry
  const validTabs = variableTypeRegistry.getValidTypes();
  const activeTab = validTabs.includes(currentTab as VariableType)
    ? (currentTab as VariableType)
    : 'colors';

  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);

  const { variables, saveMutation, deleteMutation } = useVariablesManager();

  // Handle tab changes by navigating to the appropriate URL
  const handleTabChange = (value: string | null) => {
    if (value && variableTypeRegistry.isValidType(value)) {
      navigate({
        to: '/variables/$variableType',
        params: { variableType: value },
      });
    }
  };

  const handleAdd = useCallback((type: VariableType) => {
    setEditingVariable(null);
    setEditingType(type);
    openModal();
  }, []);

  const handleEdit = useCallback((type: VariableType, variable: Variable) => {
    setEditingVariable(variable);
    setEditingType(type);
    openModal();
  }, []);

  const handleDelete = useCallback((_type: VariableType, id: number) => {
    deleteMutation.mutate(id);
  }, []);

  const handleModalClose = useCallback(() => {
    setEditingVariable(null);
    setEditingType(null);
    closeModal();
  }, []);

  const handleSave = useCallback(
    (type: VariableType, variable: Variable) => {
      saveMutation.mutate(
        { type, variable },
        {
          onSuccess: () => {
            handleModalClose();
          },
        }
      );
    },
    [handleModalClose, saveMutation]
  );

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
            {variableTypeRegistry.getAllConfigs().map((config) => {
              const IconComponent = config.icon;
              return (
                <Tabs.Tab
                  key={config.id}
                  value={config.id}
                  leftSection={<IconComponent size={16} />}
                >
                  {config.pluralName}
                </Tabs.Tab>
              );
            })}
          </Tabs.List>

          {variableTypeRegistry.getAllConfigs().map((config) => (
            <Tabs.Panel key={config.id} value={config.id} pt="xl">
              <VariableList
                type={config.id}
                variables={variables.data?.[config.id] || []}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </Tabs.Panel>
          ))}
        </Tabs>

        <UniversalVariableModal
          opened={modalOpened}
          onClose={handleModalClose}
          variableType={editingType}
          variable={editingVariable}
          onSave={handleSave}
        />
      </Stack>
    </Container>
  );
}
