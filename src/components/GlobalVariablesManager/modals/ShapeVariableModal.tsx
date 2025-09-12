import { useEffect, useState } from 'react';
import { GlobalShape } from '@shared/globals';
import { Button, Group, Modal, Select, Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';

interface ShapeVariableModalProps {
  opened: boolean;
  onClose: () => void;
  variable: GlobalShape | null;
  onSave: (variable: GlobalShape) => void;
}

const shapeTypes = [
  { value: 'image', label: 'Image (URL)' },
  { value: 'svg', label: 'SVG Code' },
  { value: 'simple-shape', label: 'Simple Shape' },
];

const simpleShapes = [
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'star', label: 'Star' },
  { value: 'hexagon', label: 'Hexagon' },
];

export function ShapeVariableModal({ opened, onClose, variable, onSave }: ShapeVariableModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name: '',
      type: 'simple-shape' as 'image' | 'svg' | 'simple-shape',
      value: '',
      description: '',
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? 'Name is required' : null),
      type: (value) => (!value ? 'Type is required' : null),
      value: (value) => (value.trim().length === 0 ? 'Value is required' : null),
    },
  });

  useEffect(() => {
    if (variable) {
      form.setValues({
        name: variable.name,
        type: variable.type,
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
      const shapeVariable: GlobalShape = {
        ...(variable?.id && { id: variable.id }),
        name: values.name.trim(),
        type: values.type,
        value: values.value.trim(),
        description: values.description.trim() || undefined,
      };

      onSave(shapeVariable);
    } catch (error) {
      console.error('Failed to save shape variable:', error);
    } finally {
      setLoading(false);
    }
  };

  const getValueInput = () => {
    switch (form.values.type) {
      case 'image':
        return (
          <TextInput
            label="Image URL"
            placeholder="https://example.com/image.png"
            required
            {...form.getInputProps('value')}
          />
        );
      case 'svg':
        return (
          <Textarea
            label="SVG Code"
            placeholder="<svg>...</svg>"
            rows={4}
            required
            {...form.getInputProps('value')}
          />
        );
      case 'simple-shape':
        return (
          <Select
            label="Shape"
            placeholder="Select a shape"
            data={simpleShapes}
            required
            {...form.getInputProps('value')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600}>{variable ? 'Edit Shape Variable' : 'Add Shape Variable'}</Text>}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="e.g., Gold Coin Icon, Resource Symbol"
            required
            {...form.getInputProps('name')}
          />

          <Select
            label="Type"
            placeholder="Select shape type"
            data={shapeTypes}
            required
            {...form.getInputProps('type')}
          />

          {getValueInput()}

          <Textarea
            label="Description"
            placeholder="Optional description of when to use this shape"
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
