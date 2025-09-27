import { forwardRef, memo, useCallback, useMemo } from 'react';
import { VariableColor } from '@shared/variables';
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
const CompactColorOption = memo(({ option }: { option: ColorOption }) => (
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
));

const ColorPreview = memo(
  ({ label, color }: { label?: string; color: VariableColor | undefined }) => {
    const colorValue = color?.value || 'transparent';
    const isTransparent = !color || color.value === 'transparent';

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
        {color && (
          <Text size="xs" c="dimmed">
            {color.name}
          </Text>
        )}
      </Group>
    );
  }
);

CompactColorOption.displayName = 'CompactColorOption';

const ColorVariableSelectorComponent = forwardRef<HTMLInputElement, ColorVariableSelectorProps>(
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
    console.log;
    const { data: variables, isLoading } = useQuery({
      queryKey: ['variables'],
      queryFn: getVariables,
    });

    const colors = variables?.colors || [];

    // Convert colors to compact select options with useMemo for performance
    const colorOptions: ColorOption[] = useMemo(
      () => [
        { value: '', label: 'No Color', color: 'transparent' },
        ...colors.map((color) => ({
          value: color.id?.toString() || '',
          label: color.name,
          color: color.value,
        })),
      ],
      [colors]
    );

    const handleChange = useCallback(
      (selectedValue: string | null) => {
        if (onChange) {
          onChange(selectedValue && selectedValue !== '' ? parseInt(selectedValue, 10) : null);
        }
      },
      [onChange]
    );

    // Find selected color for display with useMemo for performance
    const selectedColor = useMemo(() => colors.find((c) => c.id === value), [colors, value]);

    // Memoized render option function to prevent recreations
    const renderOption = useCallback(
      ({ option }: { option: any }) => {
        const colorOption = colorOptions.find((c) => c.value === option.value);
        return colorOption ? <CompactColorOption option={colorOption} /> : option.label;
      },
      [colorOptions]
    );

    // Memoized combobox props to prevent object recreation
    const comboboxProps = useMemo(
      () => ({
        dropdownPadding: 4,
        width: 250,
      }),
      []
    );

    // Memoized placeholder to prevent string recreation
    const memoizedPlaceholder = useMemo(
      () => placeholder || (isLoading ? 'Loading colors...' : 'Select a color'),
      [placeholder, isLoading]
    );

    // Memoized value string conversion
    const memoizedValue = useMemo(() => value?.toString() || '', [value]);
    return (
      <div>
        {showPreview && <ColorPreview label={label} color={selectedColor} />}
        <Select
          ref={ref}
          label={!showPreview ? label : undefined}
          placeholder={memoizedPlaceholder}
          description={description}
          error={error}
          data={colorOptions}
          value={memoizedValue}
          onChange={handleChange}
          disabled={isLoading}
          searchable={searchable}
          clearable={clearable}
          size={size}
          renderOption={renderOption}
          comboboxProps={comboboxProps}
          {...props}
        />
      </div>
    );
  }
);

ColorVariableSelectorComponent.displayName = 'ColorVariableSelector';

export const ColorVariableSelector = memo(ColorVariableSelectorComponent);
