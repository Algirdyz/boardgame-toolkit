import { CellType } from '@shared/maps';
import { Center, Group, NumberInput, Stack, Text } from '@mantine/core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { getMap, saveMap } from '@/api/mapApi';
import { CellTypesManager, EditorPageTemplate } from '@/components';
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

  const handleMapChange = (updatedMap: any) => {
    // Update the query data locally
    queryClient.setQueryData(['maps', parseInt(mapId, 10)], updatedMap);
  };

  const handleCellTypesChange = (cellTypes: CellType[]) => {
    if (map) {
      const updatedMap = {
        ...map,
        cellTypes,
      };
      handleMapChange(updatedMap);
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
        map && <MapCanvas map={map} width={width} height={height} onMapChange={handleMapChange} />
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
            </Stack>
          ),
        },
        {
          title: 'Cell Types',
          content: map && (
            <CellTypesManager
              cellTypes={map.cellTypes || []}
              onCellTypesChange={handleCellTypesChange}
            />
          ),
        },
        {
          title: 'Map Settings',
          content: map && (
            <Stack gap="sm">
              <Text size="sm" fw={500}>
                Map Dimensions
              </Text>
              <Group justify="space-between">
                <NumberInput
                  label="Width"
                  w="45%"
                  value={map.dimensions.width}
                  onChange={(value) => {
                    if (typeof value === 'number') {
                      const updatedMap = {
                        ...map,
                        dimensions: { ...map.dimensions, width: value },
                      };
                      handleMapChange(updatedMap);
                    }
                  }}
                  min={1}
                  max={50}
                />
                <NumberInput
                  label="Height"
                  w="45%"
                  value={map.dimensions.height}
                  onChange={(value) => {
                    if (typeof value === 'number') {
                      const updatedMap = {
                        ...map,
                        dimensions: {
                          ...map.dimensions,
                          width: map.dimensions.width,
                          height: value,
                        },
                      };
                      handleMapChange(updatedMap);
                    }
                  }}
                  min={1}
                  max={50}
                />
              </Group>
            </Stack>
          ),
        },
      ]}
    />
  );
}
