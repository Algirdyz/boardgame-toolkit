import { forwardRef } from 'react';
import { VariableName } from '@shared/variables';
import { Group, Select, Stack, Text } from '@mantine/core';
import { IconTag } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { getVariables } from '@/api/variablesApi';

interface NameVariableSelectorProps {
  label?: string;
  placeholder?: string;
  description?: string;
  value?: number | null;
  onChange?: (value: number | null) => void;
  clearable?: boolean;
  searchable?: boolean;
  error?: string;
}

// Component for rendering name option in dropdown
const NameOption = ({ name }: { name: VariableName }) => (
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
      <IconTag size={16} color="#666" />
    </div>
    <Stack gap={0} style={{ flex: 1 }}>
      <Text size="sm" fw={500}>
        {name.name}
      </Text>
      <Group gap="xs">
        <Text size="sm" c="green" fw={500}>
          "{name.value}"
        </Text>
        {name.description && (
          <Text size="xs" c="dimmed">
            • {name.description}
          </Text>
        )}
      </Group>
    </Stack>
  </Group>
);

export const NameVariableSelector = forwardRef<HTMLInputElement, NameVariableSelectorProps>(
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

    const names = variables?.names || [];

    // Convert names to select options with visual info
    const options = names.map((name) => ({
      value: name.id?.toString() || '',
      label: name.name,
      name,
    }));

    const handleChange = (selectedValue: string | null) => {
      if (onChange) {
        onChange(selectedValue ? parseInt(selectedValue, 10) : null);
      }
    };

    // Find selected name for display
    const selectedName = names.find((n) => n.id === value);

    return (
      <Select
        ref={ref}
        label={label}
        placeholder={placeholder || (isLoading ? 'Loading names...' : 'Select a name')}
        description={description}
        error={error}
        data={options}
        value={value?.toString() || null}
        onChange={handleChange}
        disabled={isLoading}
        searchable={searchable}
        clearable={clearable}
        leftSection={
          selectedName && (
            <Text size="xs" c="green" fw={500} truncate>
              "{selectedName.value}"
            </Text>
          )
        }
        renderOption={({ option }) => {
          const name = names.find((n) => n.id?.toString() === option.value);
          return name ? <NameOption name={name} /> : option.label;
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
