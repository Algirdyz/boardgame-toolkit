import { useState } from 'react';
import { ComponentStaticSpecs } from '@shared/components';
import { Center, Loader } from '@mantine/core';
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
          description: '',
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

  if (components.isLoading)
    return (
      <Center>
        <Loader />
      </Center>
    );
  if (components.isError) return <div>Error loading components</div>;

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
      description="Define reusable variables for colors, shapes, dimensions, and names that can be used throughout your project."
      cards={cards}
      columns={3}
      modalTitle="New Component"
      modalPlaceholder="Enter component name (e.g., Worker Slot, Resource Icon)"
      createButtonText="Create New Component"
      opened={opened}
      onClose={close}
      onOpen={open}
      name={name}
      onNameChange={setName}
      onSubmit={handleCreateComponent}
      isLoading={save.isPending}
    />
  );
}
