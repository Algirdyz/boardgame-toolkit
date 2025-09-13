import { useState } from 'react';
import { TileDefinition } from '@shared/tiles';
import { Center, Loader, Select, Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { getTemplates } from '@/api/templateApi';
import { deleteTile, getTiles, saveTile } from '@/api/tileApi';
import { OverviewPageTemplate, type NavigationCard } from '@/components';

export const Route = createFileRoute('/tiles/')({
  component: Tiles,
});

function Tiles() {
  const navigate = useNavigate({ from: '/tiles' });
  const queryClient = useQueryClient();

  const [opened, { open, close }] = useDisclosure(false);
  const [name, setName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

  const tiles = useQuery({
    queryKey: ['tiles'],
    queryFn: getTiles,
  });

  const templates = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates,
  });

  const save = useMutation({
    mutationFn: saveTile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiles'] });
    },
  });

  const deleteTileMutation = useMutation({
    mutationFn: deleteTile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tiles'] });
    },
  });

  const handleCreateTile = async () => {
    if (!name.trim() || !selectedTemplateId) return;

    const selectedTemplate = templates.data?.find((t) => t.id === selectedTemplateId);
    if (!selectedTemplate) return;

    // Initialize component choices to first choice (index 0) for all components
    const componentChoices: { [key: string]: number } = {};
    Object.keys(selectedTemplate.components).forEach((instanceId) => {
      componentChoices[instanceId] = 0;
    });

    const defaultTile: TileDefinition = {
      name,
      templateId: selectedTemplateId,
      componentChoices,
    };

    try {
      const savedTile = await save.mutateAsync(defaultTile);
      close();
      setName('');
      setSelectedTemplateId(null);
      if (savedTile.id) {
        navigate({ to: '/tiles/$tileId', params: { tileId: savedTile.id.toString() } });
      }
    } catch (error) {
      console.error('Failed to create tile:', error);
    }
  };

  const handleEdit = (tile: TileDefinition) => {
    if (tile.id) {
      navigate({ to: '/tiles/$tileId', params: { tileId: tile.id.toString() } });
    }
  };

  const handleDelete = async (tile: TileDefinition) => {
    if (tile.id) {
      await deleteTileMutation.mutateAsync(tile.id);
    }
  };

  if (tiles.isLoading || templates.isLoading) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  const cards: NavigationCard[] = (tiles.data || []).map((tile) => ({
    id: tile.id!,
    title: tile.name,
    description: `Based on template: ${templates.data?.find((t) => t.id === tile.templateId)?.name || 'Unknown'}`,
    link: `/tiles/${tile.id}`,
    onClick: () => handleEdit(tile),
    onDelete: () => handleDelete(tile),
  }));

  const templateOptions = (templates.data || []).map((template) => ({
    value: template.id!.toString(),
    label: template.name,
  }));

  return (
    <OverviewPageTemplate
      title="Tiles"
      description="Create and manage tile instances from templates"
      cards={cards}
      columns={3}
      modalTitle="New Tile"
      modalPlaceholder="Enter tile name (e.g., Forest Card, Castle Token)"
      createButtonText="Create New Tile"
      opened={opened}
      onClose={close}
      onOpen={open}
      name={name}
      onNameChange={setName}
      onSubmit={handleCreateTile}
      isLoading={save.isPending}
      additionalModalContent={
        <Stack gap="sm">
          <Text size="sm" fw={500}>
            Base Template
          </Text>
          <Select
            placeholder="Select a template..."
            data={templateOptions}
            value={selectedTemplateId?.toString() || ''}
            onChange={(value) => setSelectedTemplateId(value ? parseInt(value, 10) : null)}
          />
          <Text size="xs" c="dimmed">
            Choose the template that defines the layout and components for this tile. You can
            customize component choices after creation.
          </Text>
        </Stack>
      }
    />
  );
}
