import { CellType } from '@shared/maps';
import { Box, Button, Card, Group, ScrollArea, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { getVariables } from '@/api/variablesApi';

interface CellTypePaletteProps {
  cellTypes: CellType[];
  activeCellType: CellType | null;
  onCellTypeSelect: (cellType: CellType | null) => void;
}

export function CellTypePalette({
  cellTypes,
  activeCellType,
  onCellTypeSelect,
}: CellTypePaletteProps) {
  // Load variables for color/shape display
  const { data: variables } = useQuery({
    queryKey: ['variables'],
    queryFn: getVariables,
  });

  const colors = variables?.colors || [];
  const shapes = variables?.shapes || [];

  // Helper to get color hex value
  const getColorHex = (colorId?: number) => {
    if (!colorId) return '#e9ecef';
    const color = colors.find((c) => c.id === colorId);
    return color?.value || '#e9ecef';
  };

  // Helper to get shape name
  const getShapeName = (shapeId?: number) => {
    if (!shapeId) return 'Default';
    const shape = shapes.find((s) => s.id === shapeId);
    return shape?.name || 'Default';
  };

  if (cellTypes.length === 0) {
    return null;
  }

  return (
    <Card
      shadow="lg"
      radius="md"
      withBorder
      style={{
        maxWidth: '80vw',
        minWidth: 250,
      }}
    >
      <ScrollArea scrollbars="x" type="never">
        <Group gap="xs" wrap="nowrap" style={{ minWidth: 'max-content' }}>
          {/* Clear/Erase button */}
          <Button
            variant={activeCellType === null ? 'filled' : 'outline'}
            size="xs"
            color="gray"
            onClick={() => onCellTypeSelect(null)}
            styles={{
              root: {
                minWidth: 60,
                height: 50,
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              },
            }}
          >
            <Box
              style={{
                width: 16,
                height: 16,
                backgroundColor: 'transparent',
                border: '2px dashed #adb5bd',
                borderRadius: 3,
                marginBottom: 3,
              }}
            />
            <Text size="xs" ta="center" truncate>
              Erase
            </Text>
          </Button>

          {/* Cell type buttons */}
          {cellTypes.map((cellType) => {
            const isActive = activeCellType?.id === cellType.id;
            const colorHex = getColorHex(cellType.colorId);
            const shapeName = getShapeName(cellType.shapeId);

            return (
              <Button
                key={cellType.id}
                variant={isActive ? 'filled' : 'outline'}
                size="xs"
                color={isActive ? 'blue' : 'gray'}
                onClick={() => onCellTypeSelect(cellType)}
                styles={{
                  root: {
                    minWidth: 60,
                    height: 50,
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  },
                }}
              >
                {/* Visual preview */}
                <Box
                  style={{
                    width: 16,
                    height: 16,
                    backgroundColor: colorHex,
                    border: `1px solid ${isActive ? '#228be6' : '#ced4da'}`,
                    borderRadius: shapeName.toLowerCase().includes('circle') ? '50%' : 3,
                    marginBottom: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* Add simple shape indicators */}
                  {shapeName.toLowerCase().includes('triangle') && (
                    <div
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: '4px solid transparent',
                        borderRight: '4px solid transparent',
                        borderBottom: `7px solid ${colorHex === '#e9ecef' ? '#666' : 'white'}`,
                      }}
                    />
                  )}
                  {shapeName.toLowerCase().includes('diamond') && (
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        backgroundColor: colorHex === '#e9ecef' ? '#666' : 'white',
                        transform: 'rotate(45deg)',
                      }}
                    />
                  )}
                </Box>

                {/* Cell type name */}
                <Text size="xs" ta="center" truncate maw={55}>
                  {cellType.name}
                </Text>
              </Button>
            );
          })}
        </Group>
      </ScrollArea>
    </Card>
  );
}
