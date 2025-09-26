import { useEffect } from 'react';
import { VariableDimension } from '@shared/variables';
import { Button, Group, NumberInput, Select, Stack, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { VariableEditComponentProps } from '../variableTypeConfig';

const units = [
  { value: 'px', label: 'Pixels (px)' },
  { value: 'mm', label: 'Millimeters (mm)' },
  { value: 'cm', label: 'Centimeters (cm)' },
  { value: 'in', label: 'Inches (in)' },
];

export function DimensionEditForm({
  variable,
  onSave,
  onCancel,
  loading,
}: VariableEditComponentProps) {
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
      const dimVar = variable as VariableDimension;
      form.setValues({
        name: dimVar.name,
        value: dimVar.value,
        unit: dimVar.unit,
        description: dimVar.description || '',
      });
    } else {
      form.reset();
    }
  }, [variable]);

  const handleSubmit = (values: typeof form.values) => {
    const dimensionVariable: VariableDimension = {
      ...(variable?.id && { id: variable.id }),
      name: values.name.trim(),
      value: values.value,
      unit: values.unit,
      description: values.description.trim() || undefined,
    };

    onSave(dimensionVariable);
  };

  return (
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
          <Button variant="subtle" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {variable ? 'Update' : 'Create'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
