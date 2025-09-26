import { useEffect } from 'react';
import { VariableName } from '@shared/variables';
import { Button, Group, Stack, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { VariableEditComponentProps } from '../variableTypeConfig';

export function NameEditForm({ variable, onSave, onCancel, loading }: VariableEditComponentProps) {
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
      const nameVar = variable as VariableName;
      form.setValues({
        name: nameVar.name,
        value: nameVar.value,
        description: nameVar.description || '',
      });
    } else {
      form.reset();
    }
  }, [variable]);

  const handleSubmit = (values: typeof form.values) => {
    const nameVariable: VariableName = {
      ...(variable?.id && { id: variable.id }),
      name: values.name.trim(),
      value: values.value.trim(),
      description: values.description.trim() || undefined,
    };

    onSave(nameVariable);
  };

  return (
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
