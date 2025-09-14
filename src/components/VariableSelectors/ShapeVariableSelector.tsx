import { forwardRef } from 'react';
import { VariableShape } from '@shared/variables';
import { Badge, Group, Select, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { getVariables } from '@/api/variablesApi';

interface ShapeVariableSelectorProps {
  label?: string;
  placeholder?: string;
  description?: string;
  value?: number | null;
  onChange?: (value: number | null) => void;
  clearable?: boolean;
  searchable?: boolean;
  error?: string;
}

const getShapeTypeColor = (type: string) => {
  switch (type) {
    case 'image':
      return 'blue';
    case 'svg':
      return 'green';
    case 'simple-shape':
      return 'orange';
    default:
      return 'gray';
  }
};

const getShapeTypeLabel = (type: string) => {
  switch (type) {
    case 'image':
      return 'Image';
    case 'svg':
      return 'SVG';
    case 'simple-shape':
      return 'Shape';
    default:
      return type;
  }
};

// Component for rendering shape option in dropdown
const ShapeOption = ({ shape }: { shape: VariableShape }) => (
  <Group gap="sm" wrap="nowrap">
    <div
      style={{
        width: 32,
        height: 32,
        backgroundColor: '#f8f9fa',
        border: '1px solid #ddd',
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Badge
        size="xs"
        color={getShapeTypeColor(shape.type)}
        variant="light"
        style={{ fontSize: '8px' }}
      >
        {getShapeTypeLabel(shape.type)}
      </Badge>
    </div>
    <Stack gap={0} style={{ flex: 1 }}>
      <Text size="sm" fw={500}>
        {shape.name}
      </Text>
      <Group gap="xs">
        <Badge size="xs" color={getShapeTypeColor(shape.type)} variant="light">
          {getShapeTypeLabel(shape.type)}
        </Badge>
        {shape.description && (
          <Text size="xs" c="dimmed">
            • {shape.description}
          </Text>
        )}
      </Group>
    </Stack>
  </Group>
);

export const ShapeVariableSelector = forwardRef<HTMLInputElement, ShapeVariableSelectorProps>(
  (
    {
      value,
      onChange,
      label,
      placeholder,
      description,
      clearable = true,
      searchable = true,
      error,
      ...props
    },
    ref
  ) => {
    const { data: variables, isLoading } = useQuery({
      queryKey: ['variables'],
      queryFn: getVariables,
    });

    const shapes = variables?.shapes || [];

    // Convert shapes to select options with visual info
    const options = shapes.map((shape) => ({
      value: shape.id?.toString() || '',
      label: shape.name,
      shape,
    }));

    const handleChange = (selectedValue: string | null) => {
      if (onChange) {
        onChange(selectedValue ? parseInt(selectedValue, 10) : null);
      }
    };

    // Find selected shape for display
    const selectedShape = shapes.find((s) => s.id === value);

    return (
      <Select
        ref={ref}
        label={label}
        placeholder={placeholder || (isLoading ? 'Loading shapes...' : 'Select a shape')}
        description={description}
        error={error}
        data={options}
        value={value?.toString() || null}
        onChange={handleChange}
        disabled={isLoading}
        searchable={searchable}
        clearable={clearable}
        leftSection={
          selectedShape && (
            <Badge size="xs" color={getShapeTypeColor(selectedShape.type)} variant="light">
              {getShapeTypeLabel(selectedShape.type)}
            </Badge>
          )
        }
        renderOption={({ option }) => {
          const shape = shapes.find((s) => s.id?.toString() === option.value);
          return shape ? <ShapeOption shape={shape} /> : option.label;
        }}
        comboboxProps={{
          dropdownPadding: 8,
          shadow: 'md',
        }}
        styles={{
          option: {
            padding: '8px 12px',
          },
        }}
        {...props}
      />
    );
  }
);
