import { forwardRef } from 'react';
import { VariableColor } from '@shared/variables';
import { ColorSwatch, Group, Select, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { getVariables } from '@/api/variablesApi';

interface ColorVariableSelectorProps {
  label?: string;
  placeholder?: string;
  description?: string;
  value?: number | null;
  onChange?: (value: number | null) => void;
  clearable?: boolean;
  searchable?: boolean;
  error?: string;
}

// Component for rendering color option in dropdown
const ColorOption = ({ color }: { color: VariableColor }) => (
  <Group gap="sm" wrap="nowrap">
    <ColorSwatch color={color.value} size={24} />
    <Stack gap={0} style={{ flex: 1 }}>
      <Text size="sm" fw={500}>
        {color.name}
      </Text>
      <Group gap="xs">
        <Text size="xs" c="dimmed">
          {color.value.toUpperCase()}
        </Text>
        {color.description && (
          <Text size="xs" c="dimmed">
            • {color.description}
          </Text>
        )}
      </Group>
    </Stack>
  </Group>
);

export const ColorVariableSelector = forwardRef<HTMLInputElement, ColorVariableSelectorProps>(
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

    const colors = variables?.colors || [];

    // Convert colors to select options with visual info
    const options = colors.map((color) => ({
      value: color.id?.toString() || '',
      label: color.name,
      color,
    }));

    const handleChange = (selectedValue: string | null) => {
      if (onChange) {
        onChange(selectedValue ? parseInt(selectedValue, 10) : null);
      }
    };

    // Find selected color for display
    const selectedColor = colors.find((c) => c.id === value);

    return (
      <Select
        ref={ref}
        label={label}
        placeholder={placeholder || (isLoading ? 'Loading colors...' : 'Select a color')}
        description={description}
        error={error}
        data={options}
        value={value?.toString() || null}
        onChange={handleChange}
        disabled={isLoading}
        searchable={searchable}
        clearable={clearable}
        leftSection={selectedColor && <ColorSwatch color={selectedColor.value} size={16} />}
        renderOption={({ option }) => {
          const color = colors.find((c) => c.id?.toString() === option.value);
          return color ? <ColorOption color={color} /> : option.label;
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
