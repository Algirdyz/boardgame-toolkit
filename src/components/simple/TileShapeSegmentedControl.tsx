import { SegmentedControl } from '@mantine/core';

interface TileShapeSegmentedControlProps {
  value: 'square' | 'hexagon';
  onChange: (value: 'square' | 'hexagon') => void;
  disabled?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function TileShapeSegmentedControl({
  value,
  onChange,
  disabled = false,
  size = 'sm',
}: TileShapeSegmentedControlProps) {
  return (
    <SegmentedControl
      value={value}
      onChange={(val) => onChange(val as 'square' | 'hexagon')}
      disabled={disabled}
      size={size}
      data={[
        { label: 'Square', value: 'square' },
        { label: 'Hexagon', value: 'hexagon' },
      ]}
    />
  );
}
