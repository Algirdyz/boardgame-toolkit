import { useCallback, useEffect, useState } from 'react';
import { VariableTextStyle } from '@shared/variables';
import {
  Box,
  Button,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { useQuery } from '@tanstack/react-query';
import { VariableEditComponentProps } from '../variableTypeConfig';
import { getVariables } from '@/api/variablesApi';
import { ColorVariableSelector } from '@/components/VariableSelectors/ColorVariableSelector';
import useStaticCanvas from '@/hooks/useStaticCanvas';
import { createFabricTextWithColor } from '@/lib/fabricTextUtils';

const fontFamilyOptions = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
];

export function TextStyleEditForm({
  variable,
  onSave,
  onCancel,
  loading,
}: VariableEditComponentProps) {
  const { ref, width, height } = useElementSize();
  const { canvasHtmlRef, canvasRef, canvasDims } = useStaticCanvas(width, height);

  const variables = useQuery({
    queryKey: ['variables'],
    queryFn: getVariables,
  });

  // State for form fields
  const [name, setName] = useState('');
  const [textSize, setTextSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColorId, setTextColorId] = useState<number | undefined>(undefined);
  const [strokeWidth, setStrokeWidth] = useState(1);
  const [description, setDescription] = useState('');

  // State for validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with variable data
  useEffect(() => {
    if (variable) {
      const textVar = variable as VariableTextStyle;
      setName(textVar.name);
      setTextSize(textVar.textSize);
      setFontFamily(textVar.fontFamily);
      setTextColorId(textVar.textColorId);
      setStrokeWidth(textVar.strokeWidth);
      setDescription(textVar.description || '');
    } else {
      setName('');
      setTextSize(16);
      setFontFamily('Arial');
      setTextColorId(undefined);
      setStrokeWidth(1);
      setDescription('');
    }
    // Clear errors when resetting
    setErrors({});
  }, [variable]);

  // Update preview when form values change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !variables.data) return;

    canvas.clear();

    // Create a temporary text style from current form values
    const tempTextStyle: VariableTextStyle = {
      name: 'test',
      textSize,
      fontFamily,
      textColorId,
      strokeWidth,
    };

    const textObject = createFabricTextWithColor(tempTextStyle, variables.data.colors, {
      text: 'The quick brown fox jumps over the lazy dog',
      x: canvasDims.width / 2,
      y: canvasDims.height / 2,
      selectable: false,
      evented: false,
    });

    canvas.add(textObject);
    canvas.requestRenderAll();
  }, [textSize, fontFamily, textColorId, strokeWidth, variables.data?.colors, canvasDims]);

  // Validation function
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (textSize < 8 || textSize > 200) {
      newErrors.textSize = 'Text size must be between 8 and 200';
    }

    if (strokeWidth < 0) {
      newErrors.strokeWidth = 'Stroke width cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, textSize, strokeWidth]);
  console.log('Rendering TextStyleEditForm with errors');
  const selectColor = useCallback(
    (colorId: number | null) => {
      setTextColorId(colorId || undefined);
    },
    [setTextColorId]
  );

  return (
    <Stack gap="md">
      <TextInput
        label="Name"
        placeholder="Enter text style name"
        required
        value={name}
        onChange={(event) => setName(event.currentTarget.value)}
        error={errors.name}
      />

      <Group grow>
        <NumberInput
          label="Text Size (px)"
          placeholder="16"
          min={8}
          max={200}
          required
          value={textSize}
          onChange={(value) => setTextSize(typeof value === 'number' ? value : 16)}
          error={errors.textSize}
        />
        <Select
          label="Font Family"
          placeholder="Select font family"
          data={fontFamilyOptions}
          required
          value={fontFamily}
          onChange={(value) => setFontFamily(value || 'Arial')}
          error={errors.fontFamily}
        />
      </Group>

      <Group grow>
        <ColorVariableSelector
          label="Text Color"
          placeholder="Select color"
          value={textColorId}
          onChange={selectColor}
          clearable
          searchable
          size="sm"
        />
        <NumberInput
          label="Stroke Width (px)"
          placeholder="1"
          min={0}
          max={10}
          value={strokeWidth}
          onChange={(value) => setStrokeWidth(typeof value === 'number' ? value : 0)}
          error={errors.strokeWidth}
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
        value={description}
        onChange={(event) => setDescription(event.currentTarget.value)}
      />

      <Group justify="flex-end">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          loading={loading}
          onClick={() => {
            if (!validateForm()) {
              return;
            }

            const textStyleVariable: VariableTextStyle = {
              ...(variable?.id && { id: variable.id }),
              name: name.trim(),
              textSize,
              fontFamily,
              textColorId,
              strokeWidth,
              description: description.trim() || undefined,
            };
            onSave(textStyleVariable);
          }}
        >
          {variable ? 'Update' : 'Create'}
        </Button>
      </Group>
    </Stack>
  );
}
