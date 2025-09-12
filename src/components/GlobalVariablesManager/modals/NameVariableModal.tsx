import { useEffect, useState } from 'react';
import { GlobalName } from '@shared/globals';
import { Button, Group, Modal, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

interface NameVariableModalProps {
  opened: boolean;
  onClose: () => void;
  variable: GlobalName | null;
  onSave: (variable: GlobalName) => void;
}

export function NameVariableModal({ opened, onClose, variable, onSave }: NameVariableModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      value: '',
      description: '',
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? 'Name is required' : null),
      value: (value) => (value.trim().length === 0 ? 'Value is required' : null),
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
      const nameVariable: GlobalName = {
        ...(variable?.id && { id: variable.id }),
        name: values.name.trim(),
        value: values.value.trim(),
        description: values.description.trim() || undefined,
      };

      onSave(nameVariable);
    } catch (error) {
      console.error('Failed to save name variable:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600}>{variable ? 'Edit Name Variable' : 'Add Name Variable'}</Text>}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Variable Name"
            placeholder="e.g., Game Title, Player Name Prefix"
            required
            {...form.getInputProps('name')}
          />

          <TextInput
            label="Value"
            placeholder="e.g., My Awesome Board Game, Player"
            required
            {...form.getInputProps('value')}
          />

          <Textarea
            label="Description"
            placeholder="Optional description of when to use this name"
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
