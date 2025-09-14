import { Center, Stack, Text } from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { getMap, saveMap } from '@/api/mapApi';
import { EditorPageTemplate } from '@/components';
import { MapCanvas } from '@/components/canvas/MapCanvas';

export const Route = createFileRoute('/maps/$mapId')({
  component: MapEditor,
});

function MapEditor() {
  const { mapId } = Route.useParams();
  const queryClient = useQueryClient();

  // Fetch map data
  const mapQuery = useQuery({
    queryKey: ['maps', parseInt(mapId, 10)],
    queryFn: () => getMap(parseInt(mapId, 10)),
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: saveMap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maps'] });
    },
  });

  const handleSave = async () => {
    if (mapQuery.data) {
      await saveMutation.mutateAsync(mapQuery.data);
    }
  };

  const isLoading = mapQuery.isLoading;

  if (mapQuery.error) {
    return (
      <Center h="100vh">
        <div>Error loading map data</div>
      </Center>
    );
  }

  const map = mapQuery.data;

  return (
    <EditorPageTemplate
      title={`Editing Map: ${map?.name}`}
      loading={isLoading}
      canvasElement={(width, height) =>
        map && (
          <MapCanvas
            map={map}
            width={width}
            height={height}
            onMapChange={(updatedMap) => {
              // Update the query data locally
              queryClient.setQueryData(['maps', parseInt(mapId, 10)], updatedMap);
            }}
          />
        )
      }
      onSave={handleSave}
      isSaving={saveMutation.isPending}
      showEditLock={false}
      sections={[
        {
          title: 'Map Info',
          content: map && (
            <Stack gap="sm">
              <Text size="sm">
                <strong>Name:</strong> {map.name}
              </Text>
              <Text size="sm">
                <strong>Tile Shape:</strong> {map.tileShape === 'hexagon' ? 'Hexagonal' : 'Square'}
              </Text>
              <Text size="xs" c="dimmed">
                Map editing features will be added in future updates. Currently showing a preview of
                your map configuration.
              </Text>
            </Stack>
          ),
        },
        {
          title: 'Map Settings',
          content: (
            <Stack gap="sm">
              <Text size="sm" c="dimmed">
                Map settings and editing tools will be available here:
              </Text>
              <Text size="xs" c="dimmed">
                • Add/remove tiles
              </Text>
              <Text size="xs" c="dimmed">
                • Set tile properties
              </Text>
              <Text size="xs" c="dimmed">
                • Configure map boundaries
              </Text>
              <Text size="xs" c="dimmed">
                • Import/export map data
              </Text>
            </Stack>
          ),
        },
      ]}
    />
  );
}
