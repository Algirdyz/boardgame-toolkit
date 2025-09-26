import { useEffect } from 'react';
import { VariableColor } from '@shared/variables';
import { Button, ColorInput, Group, Stack, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { VariableEditComponentProps } from '../variableTypeConfig';

export function ColorEditForm({ variable, onSave, onCancel, loading }: VariableEditComponentProps) {
  const form = useForm({
    initialValues: {
      name: '',
      value: '#000000',
      description: '',
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? 'Name is required' : null),
      value: (value) => {
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        return !hexRegex.test(value) ? 'Please enter a valid hex color' : null;
      },
    },
  });

  useEffect(() => {
    if (variable) {
      const colorVar = variable as VariableColor;
      form.setValues({
        name: colorVar.name,
        value: colorVar.value,
        description: colorVar.description || '',
      });
    } else {
      form.reset();
    }
  }, [variable]);

  const handleSubmit = (values: typeof form.values) => {
    const colorVariable: VariableColor = {
      ...(variable?.id && { id: variable.id }),
      name: values.name.trim(),
      value: values.value,
      description: values.description.trim() || undefined,
    };

    onSave(colorVariable);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Name"
          placeholder="e.g., Primary Blue, Gold Coin"
          required
          {...form.getInputProps('name')}
        />

        <ColorInput
          label="Color"
          placeholder="Select or enter a color"
          required
          {...form.getInputProps('value')}
        />

        <Textarea
          label="Description"
          placeholder="Optional description of when to use this color"
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
