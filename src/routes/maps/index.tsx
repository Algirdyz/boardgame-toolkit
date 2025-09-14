import { useState } from 'react';
import { MapDefinition } from '@shared/maps';
import { Stack, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { deleteMap, getMaps, saveMap } from '@/api/mapApi';
import { OverviewPageTemplate, type NavigationCard } from '@/components';
import { TileShapeSegmentedControl } from '@/components/simple/TileShapeSegmentedControl';

export const Route = createFileRoute('/maps/')({
  component: Maps,
});

function Maps() {
  const navigate = useNavigate({ from: '/maps' });
  const queryClient = useQueryClient();

  const [opened, { open, close }] = useDisclosure(false);
  const [name, setName] = useState('');
  const [tileShape, setTileShape] = useState<'square' | 'hexagon'>('square');

  const maps = useQuery({
    queryKey: ['maps'],
    queryFn: getMaps,
  });

  const save = useMutation({
    mutationFn: saveMap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maps'] });
    },
  });

  const deleteMapMutation = useMutation({
    mutationFn: deleteMap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maps'] });
    },
  });

  const handleCreateMap = async () => {
    if (!name.trim()) return;

    const defaultMap: MapDefinition = {
      name,
      tileShape,
      dimensions: { width: 10, height: 8 },
    };

    try {
      const savedMap = await save.mutateAsync(defaultMap);
      close();
      setName('');
      setTileShape('square');
      if (savedMap.id) {
        navigate({ to: '/maps/$mapId', params: { mapId: savedMap.id.toString() } });
      }
    } catch (error) {
      console.error('Failed to create map:', error);
    }
  };

  const handleEdit = (map: MapDefinition) => {
    if (map.id) {
      navigate({ to: '/maps/$mapId', params: { mapId: map.id.toString() } });
    }
  };

  const handleDelete = async (map: MapDefinition) => {
    if (map.id) {
      await deleteMapMutation.mutateAsync(map.id);
    }
  };

  const cards: NavigationCard[] = (maps.data || []).map((map) => ({
    id: map.id!,
    title: map.name,
    description: `${map.tileShape === 'hexagon' ? 'Hexagonal' : 'Square'} tile grid`,
    link: `/maps/${map.id}`,
    onClick: () => handleEdit(map),
    onDelete: () => handleDelete(map),
  }));

  return (
    <OverviewPageTemplate
      title="Maps"
      description="Create and manage game maps with different tile shapes and layouts"
      cards={cards}
      columns={3}
      loading={maps.isLoading}
      isError={maps.isError}
      modalTitle="New Map"
      modalPlaceholder="Enter map name (e.g., Dungeon Level 1, World Map)"
      createButtonText="Create New Map"
      opened={opened}
      onClose={close}
      onOpen={open}
      name={name}
      onNameChange={setName}
      onSubmit={handleCreateMap}
      createPending={save.isPending}
      additionalModalContent={
        <Stack gap="sm">
          <Text size="sm" fw={500}>
            Tile Shape
          </Text>
          <TileShapeSegmentedControl value={tileShape} onChange={setTileShape} />
          <Text size="xs" c="dimmed">
            Choose the tile shape for your map. Square tiles form rectangular grids, while hex tiles
            form honeycomb patterns for more strategic movement options.
          </Text>
        </Stack>
      }
    />
  );
}
