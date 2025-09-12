import { useEffect, useState } from 'react';
import { VariableDimension } from '@shared/variables';
import {
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';

interface DimensionVariableModalProps {
  opened: boolean;
  onClose: () => void;
  variable: VariableDimension | null;
  onSave: (variable: VariableDimension) => void;
}

const units = [
  { value: 'px', label: 'Pixels (px)' },
  { value: 'mm', label: 'Millimeters (mm)' },
  { value: 'cm', label: 'Centimeters (cm)' },
  { value: 'in', label: 'Inches (in)' },
];

export function DimensionVariableModal({
  opened,
  onClose,
  variable,
  onSave,
}: DimensionVariableModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      value: 0,
      unit: 'mm' as 'px' | 'mm' | 'cm' | 'in',
      description: '',
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? 'Name is required' : null),
      value: (value) => (value <= 0 ? 'Value must be greater than 0' : null),
      unit: (value) => (!value ? 'Unit is required' : null),
    },
  });

  useEffect(() => {
    if (variable) {
      form.setValues({
        name: variable.name,
        value: variable.value,
        unit: variable.unit,
        description: variable.description || '',
      });
    } else {
      form.reset();
    }
  }, [variable, opened]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      const dimensionVariable: VariableDimension = {
        ...(variable?.id && { id: variable.id }),
        name: values.name.trim(),
        value: values.value,
        unit: values.unit,
        description: values.description.trim() || undefined,
      };

      onSave(dimensionVariable);
    } catch (error) {
      console.error('Failed to save dimension variable:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600}>{variable ? 'Edit Dimension Variable' : 'Add Dimension Variable'}</Text>
      }
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="e.g., Card Width, Tile Size, Border Radius"
            required
            {...form.getInputProps('name')}
          />

          <Group grow>
            <NumberInput
              label="Value"
              placeholder="Enter dimension value"
              min={0}
              step={0.1}
              decimalScale={2}
              required
              {...form.getInputProps('value')}
            />

            <Select
              label="Unit"
              placeholder="Select unit"
              data={units}
              required
              {...form.getInputProps('unit')}
            />
          </Group>

          <Textarea
            label="Description"
            placeholder="Optional description of when to use this dimension"
            rows={3}
            {...form.getInputProps('description')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              {variable ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
