import { useState } from 'react';
import { CellType } from '@shared/maps';
import { ActionIcon, Button, Card, Group, Select, Stack, Text, TextInput } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { getVariables } from '@/api/variablesApi';

// Simple UUID generator for client-side use
const generateId = () => Math.random().toString(36).substr(2, 9);

interface CellTypesManagerProps {
  cellTypes: CellType[];
  onCellTypesChange: (cellTypes: CellType[]) => void;
}

export function CellTypesManager({ cellTypes, onCellTypesChange }: CellTypesManagerProps) {
  const [newCellTypeName, setNewCellTypeName] = useState('');

  // Fetch variables for color and shape options
  const variablesQuery = useQuery({
    queryKey: ['variables'],
    queryFn: getVariables,
  });

  const variables = variablesQuery.data;

  // Prepare color options for Select component
  const colorOptions =
    variables?.colors.map((color) => ({
      value: color.id?.toString() || '',
      label: `${color.name} (${color.value})`,
    })) || [];

  // Prepare shape options for Select component
  const shapeOptions =
    variables?.shapes.map((shape) => ({
      value: shape.id?.toString() || '',
      label: `${shape.name} (${shape.type})`,
    })) || [];

  const handleAddCellType = () => {
    if (!newCellTypeName.trim()) return;

    const newCellType: CellType = {
      id: generateId(),
      name: newCellTypeName.trim(),
    };

    onCellTypesChange([...cellTypes, newCellType]);
    setNewCellTypeName('');
  };

  const handleDeleteCellType = (cellTypeId: string) => {
    onCellTypesChange(cellTypes.filter((ct) => ct.id !== cellTypeId));
  };

  const handleUpdateCellType = (cellTypeId: string, updates: Partial<CellType>) => {
    onCellTypesChange(cellTypes.map((ct) => (ct.id === cellTypeId ? { ...ct, ...updates } : ct)));
  };

  if (variablesQuery.isLoading) {
    return <Text size="sm">Loading variables...</Text>;
  }

  return (
    <Stack gap="md">
      <div>
        <Text size="sm" fw={500} mb="sm">
          Cell Types
        </Text>
        <Text size="xs" c="dimmed" mb="md">
          Define different types of cells that can be painted on your map
        </Text>
      </div>

      {/* Add new cell type */}
      <Card withBorder>
        <Stack gap="sm">
          <Text size="sm" fw={500}>
            Add New Cell Type
          </Text>
          <TextInput
            label="Cell Type Name"
            placeholder="e.g., Grass, Water, Mountain"
            value={newCellTypeName}
            onChange={(e) => setNewCellTypeName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddCellType();
              }
            }}
          />
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={handleAddCellType}
            disabled={!newCellTypeName.trim()}
            size="sm"
          >
            Add Cell Type
          </Button>
        </Stack>
      </Card>

      {/* Existing cell types */}
      {cellTypes.length > 0 && (
        <Stack gap="sm">
          {cellTypes.map((cellType) => (
            <Card key={cellType.id} withBorder>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text size="sm" fw={500}>
                    {cellType.name}
                  </Text>
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => handleDeleteCellType(cellType.id)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>

                <Select
                  label="Color"
                  placeholder="Select a color variable"
                  data={colorOptions}
                  value={cellType.colorId?.toString() || null}
                  onChange={(value) =>
                    handleUpdateCellType(cellType.id, {
                      colorId: value ? parseInt(value, 10) : undefined,
                    })
                  }
                  clearable
                />

                <Select
                  label="Shape"
                  placeholder="Select a shape variable"
                  data={shapeOptions}
                  value={cellType.shapeId?.toString() || null}
                  onChange={(value) =>
                    handleUpdateCellType(cellType.id, {
                      shapeId: value ? parseInt(value, 10) : undefined,
                    })
                  }
                  clearable
                />
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      {cellTypes.length === 0 && (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          No cell types defined yet. Add one above to get started.
        </Text>
      )}
    </Stack>
  );
}
