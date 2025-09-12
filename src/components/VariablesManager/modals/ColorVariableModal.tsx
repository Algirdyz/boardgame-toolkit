import { useEffect, useState } from 'react';
import { VariableColor } from '@shared/variables';
import { Button, ColorInput, Group, Modal, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

interface ColorVariableModalProps {
  opened: boolean;
  onClose: () => void;
  variable: VariableColor | null;
  onSave: (variable: VariableColor) => void;
}

export function ColorVariableModal({ opened, onClose, variable, onSave }: ColorVariableModalProps) {
  const [loading, setLoading] = useState(false);

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
      form.setValues({
        name: variable.name,
        value: variable.value,
        description: variable.description || '',
      });
    } else {
      form.reset();
    }
  }, [variable, opened]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      const colorVariable: VariableColor = {
        ...(variable?.id && { id: variable.id }),
        name: values.name.trim(),
        value: values.value,
        description: values.description.trim() || undefined,
      };

      onSave(colorVariable);
    } catch (error) {
      console.error('Failed to save color variable:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600}>{variable ? 'Edit Color Variable' : 'Add Color Variable'}</Text>}
      size="md"
    >
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
