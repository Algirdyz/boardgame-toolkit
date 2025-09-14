import { useState } from 'react';
import { TemplateDefinition } from '@shared/templates';
import { Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { deleteTemplate, getTemplates, saveTemplate } from '@/api/templateApi';
import { OverviewPageTemplate, type NavigationCard } from '@/components';
import { TileShapeSegmentedControl } from '@/components/simple/TileShapeSegmentedControl';

export const Route = createFileRoute('/templates/')({
  component: Templates,
});

function Templates() {
  const navigate = useNavigate({ from: '/templates' });
  const queryClient = useQueryClient();

  const [opened, { open, close }] = useDisclosure(false);
  const [name, setName] = useState('');
  const [tileShapeType, setTileShapeType] = useState<'square' | 'hexagon'>('square');

  const templates = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates,
  });

  const save = useMutation({
    mutationFn: saveTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const handleCreateTemplate = async () => {
    if (!name.trim()) return;

    const defaultTemplate: TemplateDefinition = {
      name,
      shape: { vertices: [{ x: 0, y: 0 }], type: 'square' },
      components: {},
    };
    const savedTemplate = await save.mutateAsync(defaultTemplate);
    close();
    setName('');
    setTileShapeType('square'); // Reset to default
    navigate({ to: `/templates/${savedTemplate.id}` });
  };

  if (templates.isError) return <div>Error loading templates</div>;

  const cards: NavigationCard[] = templates.data
    ? templates.data.map((t) => ({
        title: t.name,
        subtitle: `${0} shape points`,
        link: `/templates/${t.id}`,
        onDelete: t.id ? () => deleteTemplateMutation.mutate(t.id!) : undefined,
      }))
    : [];

  return (
    <OverviewPageTemplate
      title="Templates"
      description="Create and manage game board templates with customizable shapes, worker slots, and resource layouts."
      cards={cards}
      columns={3}
      loading={templates.isLoading}
      isError={templates.isError}
      modalTitle="New Template"
      modalPlaceholder="Enter template name (e.g., Card Template, Token Layout)"
      createButtonText="Create New Template"
      opened={opened}
      onClose={close}
      onOpen={open}
      name={name}
      onNameChange={setName}
      onSubmit={handleCreateTemplate}
      createPending={save.isPending}
      additionalModalContent={
        <Stack gap="sm">
          <Text size="sm" fw={500}>
            Tile Shape
          </Text>
          <TileShapeSegmentedControl value={tileShapeType} onChange={setTileShapeType} />
          <Text size="xs" c="dimmed">
            Choose the grid type for your template. Square grids use rectangular positioning, while
            hexagon grids use honeycomb patterns. This cannot be changed after creation as it would
            break component positioning.
          </Text>
        </Stack>
      }
    />
  );
}
