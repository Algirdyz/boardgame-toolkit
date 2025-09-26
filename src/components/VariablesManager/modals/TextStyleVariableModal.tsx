import { useEffect, useState } from 'react';
import { VariableTextStyle } from '@shared/variables';
import {
  Box,
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
import { useElementSize } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { getVariables } from '@/api/variablesApi';
import { ColorVariableSelector } from '@/components/VariableSelectors/ColorVariableSelector';
import useFabricCanvas from '@/hooks/useFabricCanvas';
import { createFabricTextWithColor } from '@/lib/fabricTextUtils';

interface TextStyleVariableModalProps {
  opened: boolean;
  onClose: () => void;
  variable: VariableTextStyle | null;
  onSave: (variable: VariableTextStyle) => void;
}

export function TextStyleVariableModal({
  opened,
  onClose,
  variable,
  onSave,
}: TextStyleVariableModalProps) {
  const [loading, setLoading] = useState(false);
  const { ref, width, height } = useElementSize();
  const { canvasHtmlRef, canvasRef, canvasDims } = useFabricCanvas(width, height, {
    showGrid: false,
  });

  const variables = useQuery({
    queryKey: ['variables'],
    queryFn: getVariables,
  });

  const form = useForm({
    initialValues: {
      name: '',
      textSize: 16,
      fontFamily: 'Arial',
      textColorId: undefined as number | undefined,
      strokeWidth: 1,
      description: '',
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? 'Name is required' : null),
      textSize: (value) =>
        value < 8 || value > 200 ? 'Text size must be between 8 and 200' : null,
      strokeWidth: (value) => (value < 0 ? 'Stroke width cannot be negative' : null),
    },
  });

  useEffect(() => {
    if (variable) {
      form.setValues({
        name: variable.name,
        textSize: variable.textSize,
        fontFamily: variable.fontFamily,
        textColorId: variable.textColorId,
        strokeWidth: variable.strokeWidth,
        description: variable.description || '',
      });
    } else {
      form.reset();
    }
  }, [variable, opened]);

  // Initialize Fabric canvas

  // Update preview when form values change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !variables.data || !opened) return;

    canvas.clear();

    // Create a temporary text style from current form values
    const tempTextStyle: VariableTextStyle = {
      name: form.values.name,
      textSize: form.values.textSize,
      fontFamily: form.values.fontFamily,
      textColorId: form.values.textColorId,
      strokeWidth: form.values.strokeWidth,
    };

    const textObject = createFabricTextWithColor(tempTextStyle, variables.data.colors, {
      text: 'The quick brown fox jumps over the lazy dog',
      x: canvasDims.width / 2,
      y: canvasDims.height / 2,
      selectable: false,
      evented: false,
    });

    canvas.add(textObject);
    canvas.renderAll();
  }, [form.values, variables.data, canvasDims, opened]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);
      const textStyleVariable: VariableTextStyle = {
        ...(variable?.id && { id: variable.id }),
        name: values.name.trim(),
        textSize: values.textSize,
        fontFamily: values.fontFamily,
        textColorId: values.textColorId,
        strokeWidth: values.strokeWidth,
        description: values.description.trim() || undefined,
      };
      onSave(textStyleVariable);
    } catch (error) {
      console.error('Error saving text style:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const fontFamilyOptions = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Courier New', label: 'Courier New' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Verdana', label: 'Verdana' },
  ];

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={variable ? 'Edit Text Style' : 'Create Text Style'}
      size="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Name"
            placeholder="Enter text style name"
            required
            {...form.getInputProps('name')}
          />

          <Group grow>
            <NumberInput
              label="Text Size (px)"
              placeholder="16"
              min={8}
              max={200}
              required
              {...form.getInputProps('textSize')}
            />
            <Select
              label="Font Family"
              placeholder="Select font family"
              data={fontFamilyOptions}
              required
              {...form.getInputProps('fontFamily')}
            />
          </Group>

          <Group grow>
            <ColorVariableSelector
              label="Text Color"
              placeholder="Select color"
              value={form.values.textColorId}
              onChange={(value) => form.setFieldValue('textColorId', value || undefined)}
              clearable
              searchable
              size="sm"
            />
            <NumberInput
              label="Stroke Width (px)"
              placeholder="1"
              min={0}
              max={10}
              {...form.getInputProps('strokeWidth')}
            />
          </Group>

          <div>
            <Text size="sm" fw={500} mb="xs">
              Preview
            </Text>
            <Box ref={ref} w="100%" h="60px">
              <canvas
                ref={canvasHtmlRef}
                style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                }}
              />
            </Box>
          </div>

          <Textarea
            label="Description"
            placeholder="Optional description"
            rows={3}
            {...form.getInputProps('description')}
          />

          <Group justify="flex-end">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} disabled={!form.isValid()}>
              {variable ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
