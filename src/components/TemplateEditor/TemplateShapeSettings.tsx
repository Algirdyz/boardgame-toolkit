import { TemplateDefinition } from '@shared/templates';
import { Stack, Text } from '@mantine/core';
import { TileShapeSegmentedControl } from '@/components/simple/TileShapeSegmentedControl';

interface TemplateShapeSettingsProps {
  template: TemplateDefinition;
  onTemplateChange: (template: TemplateDefinition) => void;
  disabled?: boolean;
}

export function TemplateShapeSettings({
  template,
  onTemplateChange,
  disabled = false,
}: TemplateShapeSettingsProps) {
  const currentShapeType = template.tileShapeType || 'square';

  const handleShapeTypeChange = (shapeType: 'square' | 'hexagon') => {
    onTemplateChange({
      ...template,
      tileShapeType: shapeType,
    });
  };

  return (
    <Stack gap="sm">
      <Text size="sm" fw={500}>
        Tile Shape
      </Text>
      <TileShapeSegmentedControl
        value={currentShapeType}
        onChange={handleShapeTypeChange}
        disabled={disabled}
        size="sm"
      />
      <Text size="xs" c="dimmed">
        Choose the base tile shape for this template. Square tiles form rectangular grids, while
        hexagonal tiles form honeycomb patterns.
      </Text>
    </Stack>
  );
}
