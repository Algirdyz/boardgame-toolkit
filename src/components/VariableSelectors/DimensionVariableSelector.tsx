import { forwardRef } from 'react';
import { VariableDimension } from '@shared/variables';
import { Group, Select, Stack, Text } from '@mantine/core';
import { IconRuler } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { getVariables } from '@/api/variablesApi';

interface DimensionVariableSelectorProps {
  label?: string;
  placeholder?: string;
  description?: string;
  value?: number | null;
  onChange?: (value: number | null) => void;
  clearable?: boolean;
  searchable?: boolean;
  error?: string;
}

// Component for rendering dimension option in dropdown
const DimensionOption = ({ dimension }: { dimension: VariableDimension }) => (
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
      <IconRuler size={16} color="#666" />
    </div>
    <Stack gap={0} style={{ flex: 1 }}>
      <Text size="sm" fw={500}>
        {dimension.name}
      </Text>
      <Group gap="xs">
        <Text size="sm" c="blue" fw={500}>
          {dimension.value} {dimension.unit}
        </Text>
        {dimension.description && (
          <Text size="xs" c="dimmed">
            • {dimension.description}
          </Text>
        )}
      </Group>
    </Stack>
  </Group>
);

export const DimensionVariableSelector = forwardRef<
  HTMLInputElement,
  DimensionVariableSelectorProps
>(
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

    const dimensions = variables?.dimensions || [];

    // Convert dimensions to select options with visual info
    const options = dimensions.map((dimension) => ({
      value: dimension.id?.toString() || '',
      label: dimension.name,
      dimension,
    }));

    const handleChange = (selectedValue: string | null) => {
      if (onChange) {
        onChange(selectedValue ? parseInt(selectedValue, 10) : null);
      }
    };

    // Find selected dimension for display
    const selectedDimension = dimensions.find((d) => d.id === value);

    return (
      <Select
        ref={ref}
        label={label}
        placeholder={placeholder || (isLoading ? 'Loading dimensions...' : 'Select a dimension')}
        description={description}
        error={error}
        data={options}
        value={value?.toString() || null}
        onChange={handleChange}
        disabled={isLoading}
        searchable={searchable}
        clearable={clearable}
        leftSection={
          selectedDimension && (
            <Text size="xs" c="blue" fw={500}>
              {selectedDimension.value}
              {selectedDimension.unit}
            </Text>
          )
        }
        renderOption={({ option }) => {
          const dimension = dimensions.find((d) => d.id?.toString() === option.value);
          return dimension ? <DimensionOption dimension={dimension} /> : option.label;
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
