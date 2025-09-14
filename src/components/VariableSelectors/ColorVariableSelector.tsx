import { forwardRef } from 'react';
import { Group, Select, Text } from '@mantine/core';
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
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showPreview?: boolean;
}

interface ColorOption {
  value: string;
  label: string;
  color: string;
}

// Compact component for rendering color option in dropdown
const CompactColorOption = ({ option }: { option: ColorOption }) => (
  <Group gap="sm">
    <div
      style={{
        width: 16,
        height: 16,
        backgroundColor: option.color === 'transparent' ? '#f8f9fa' : option.color,
        border: option.color === 'transparent' ? '2px dashed #ccc' : '1px solid #ccc',
        borderRadius: 3,
      }}
    />
    <Text size="sm">{option.label}</Text>
    {option.color !== 'transparent' && (
      <Text size="xs" c="dimmed">
        ({option.color})
      </Text>
    )}
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
      searchable = false,
      error,
      size = 'sm',
      showPreview = true,
      ...props
    },
    ref
  ) => {
    const { data: variables, isLoading } = useQuery({
      queryKey: ['variables'],
      queryFn: getVariables,
    });

    const colors = variables?.colors || [];

    // Convert colors to compact select options
    const colorOptions: ColorOption[] = [
      { value: '', label: 'No Color', color: 'transparent' },
      ...colors.map((color) => ({
        value: color.id?.toString() || '',
        label: color.name,
        color: color.value,
      })),
    ];

    const handleChange = (selectedValue: string | null) => {
      if (onChange) {
        onChange(selectedValue && selectedValue !== '' ? parseInt(selectedValue, 10) : null);
      }
    };

    // Find selected color for display
    const selectedColor = colors.find((c) => c.id === value);

    // Helper function to render selected color preview
    const renderSelectedColorPreview = () => {
      if (!showPreview) return null;

      const colorValue = selectedColor?.value || 'transparent';
      const isTransparent = !selectedColor || colorValue === 'transparent';

      return (
        <Group gap="xs" align="center" mb={2}>
          {label && (
            <Text size="xs" fw={500}>
              {label}
            </Text>
          )}
          <div
            style={{
              width: 16,
              height: 16,
              backgroundColor: isTransparent ? '#f8f9fa' : colorValue,
              border: isTransparent ? '2px dashed #ccc' : '1px solid #ccc',
              borderRadius: 3,
            }}
          />
          {selectedColor && (
            <Text size="xs" c="dimmed">
              {selectedColor.name}
            </Text>
          )}
        </Group>
      );
    };

    return (
      <div>
        {showPreview && renderSelectedColorPreview()}
        <Select
          ref={ref}
          label={!showPreview ? label : undefined}
          placeholder={placeholder || (isLoading ? 'Loading colors...' : 'Select a color')}
          description={description}
          error={error}
          data={colorOptions}
          value={value?.toString() || ''}
          onChange={handleChange}
          disabled={isLoading}
          searchable={searchable}
          clearable={clearable}
          size={size}
          renderOption={({ option }) => {
            const colorOption = colorOptions.find((c) => c.value === option.value);
            return colorOption ? <CompactColorOption option={colorOption} /> : option.label;
          }}
          comboboxProps={{
            dropdownPadding: 4,
            width: 250,
          }}
          {...props}
        />
      </div>
    );
  }
);

ColorVariableSelector.displayName = 'ColorVariableSelector';
