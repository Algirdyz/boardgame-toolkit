import { useEffect } from 'react';
import { VariableShape } from '@shared/variables';
import { Button, Group, Paper, Select, Stack, Textarea, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ShapePreview } from '../modals/ShapePreview';
import { VariableEditComponentProps } from '../variableTypeConfig';
import { SimpleShapeType } from '@/lib/fabricRenderer/simpleShapeTypes';

const shapeTypes = [
  { value: 'image', label: 'Image (URL)' },
  { value: 'svg', label: 'SVG Code' },
  { value: 'simple-shape', label: 'Simple Shape' },
];

const simpleShapes: { value: SimpleShapeType; label: string }[] = [
  { value: 'circle', label: 'Circle' },
  { value: 'square', label: 'Square' },
  { value: 'triangle', label: 'Triangle' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'star', label: 'Star' },
  { value: 'hexagon', label: 'Hexagon' },
  { value: 'rounded', label: 'Rounded Square' },
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'ellipse', label: 'Ellipse' },
];

export function ShapeEditForm({ variable, onSave, onCancel, loading }: VariableEditComponentProps) {
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
      const shapeVar = variable as VariableShape;
      form.setValues({
        name: shapeVar.name,
        type: shapeVar.type,
        value: shapeVar.value,
        description: shapeVar.description || '',
      });
    } else {
      form.reset();
    }
  }, [variable]);

  const handleSubmit = (values: typeof form.values) => {
    const shapeVariable: VariableShape = {
      ...(variable?.id && { id: variable.id }),
      name: values.name.trim(),
      type: values.type,
      value: values.value.trim(),
      description: values.description.trim() || undefined,
    };

    onSave(shapeVariable);
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
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <Group grow align="flex-start">
          <Stack gap="md" style={{ flex: 1 }}>
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
          </Stack>

          <Paper p="md" withBorder>
            <Title order={6} mb="sm">
              Preview
            </Title>
            <ShapePreview
              shape={{
                type: form.values.type,
                value: form.values.value,
                name: form.values.name || 'Preview',
                description: form.values.description,
                id: variable?.id,
              }}
              width={200}
              height={150}
            />
          </Paper>
        </Group>

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
