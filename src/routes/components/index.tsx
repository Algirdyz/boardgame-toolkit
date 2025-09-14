import { useState } from 'react';
import { ComponentStaticSpecs } from '@shared/components';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { deleteComponent, getComponents, saveComponent } from '@/api/componentApi';
import { OverviewPageTemplate, type NavigationCard } from '@/components';

export const Route = createFileRoute('/components/')({
  component: Components,
});

function Components() {
  const navigate = useNavigate({ from: '/components' });
  const queryClient = useQueryClient();

  const [opened, { open, close }] = useDisclosure(false);
  const [name, setName] = useState('');

  const components = useQuery({
    queryKey: ['components'],
    queryFn: getComponents,
  });

  const save = useMutation({
    mutationFn: saveComponent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
    },
  });

  const deleteComponentMutation = useMutation({
    mutationFn: deleteComponent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
    },
  });

  const handleCreateComponent = async () => {
    if (!name.trim()) return;

    const defaultComponent: ComponentStaticSpecs = {
      name,
      description: '',
      shapeId: 1, // Default to first shape
      width: 50,
      height: 50,
      choices: [
        {
          id: 1,
          name: 'Default',
          fillColorId: 1,
          strokeColorId: 1,
        },
      ],
    };
    const savedComponent = await save.mutateAsync(defaultComponent);
    close();
    setName('');
    navigate({ to: `/components/${savedComponent.id}` });
  };

  const cards: NavigationCard[] = components.data
    ? components.data.map((c) => ({
        title: c.name,
        subtitle: c.description,
        link: `/components/${c.id}`,
        onDelete: c.id ? () => deleteComponentMutation.mutate(c.id!) : undefined,
      }))
    : [];

  return (
    <OverviewPageTemplate
      title="Components"
      description="Create and manage reusable game components with customizable properties and variables."
      cards={cards}
      columns={3}
      loading={components.isLoading}
      isError={components.isError}
      modalTitle="New Component"
      modalPlaceholder="Enter component name (e.g., Resource Token, Worker Meeple)"
      createButtonText="Create New Component"
      opened={opened}
      onClose={close}
      onOpen={open}
      name={name}
      onNameChange={setName}
      onSubmit={handleCreateComponent}
      createPending={save.isPending}
    />
  );
}
