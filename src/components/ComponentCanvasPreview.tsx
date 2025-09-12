import React, { useEffect, useRef, useState } from 'react';
import { ComponentStaticSpecs } from '@shared/components';
import { Box, Button, Group, Stack, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import * as fabric from 'fabric';
import { getComponents } from '@/api/componentApi';
import { getVariables } from '@/api/variablesApi';
import { addComponentToCanvas, clearCanvas, RenderContext } from '@/lib/fabricRenderer';

interface ComponentCanvasPreviewProps {
  width?: number;
  height?: number;
}

export function ComponentCanvasPreview({ width = 400, height = 300 }: ComponentCanvasPreviewProps) {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(0);

  // Fetch variable definitions and components
  const { data: variables } = useQuery({
    queryKey: ['variables'],
    queryFn: getVariables,
  });

  const { data: components } = useQuery({
    queryKey: ['components'],
    queryFn: getComponents,
  });

  // Initialize canvas
  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width,
      height,
      backgroundColor: '#f8f9fa',
      selection: false,
    });

    canvasRef.current = canvas;

    return () => {
      canvas.dispose();
      canvasRef.current = null;
    };
  }, [width, height]);

  // Create render context
  const renderContext: RenderContext | null = React.useMemo(() => {
    if (!canvasRef.current || !variables || !components) return null;

    return {
      canvas: canvasRef.current,
      variables,
      components,
      scale: 1,
    };
  }, [variables, components]);

  const handleRenderComponent = async () => {
    if (!renderContext || !selectedComponentId) return;

    // Clear canvas first
    clearCanvas(renderContext.canvas);

    // Add component to canvas
    await addComponentToCanvas(selectedComponentId, renderContext, {
      position: {
        x: width / 2,
        y: height / 2,
        rotation: 0,
        scale: 1,
      },
      choiceIndex: selectedChoiceIndex,
      allowInteraction: true,
    });
  };

  const handleClearCanvas = () => {
    if (!renderContext) return;
    clearCanvas(renderContext.canvas);
  };

  const availableComponents: ComponentStaticSpecs[] = components || [];
  const selectedComponent = availableComponents.find(
    (c: ComponentStaticSpecs) => c.id === selectedComponentId
  );

  return (
    <Stack gap="md">
      <Text size="lg" fw={600}>
        Component Canvas Preview
      </Text>

      <Group gap="md">
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            Select Component:
          </Text>
          {availableComponents.map((component: ComponentStaticSpecs) => (
            <Button
              key={component.id}
              variant={selectedComponentId === component.id ? 'filled' : 'outline'}
              size="xs"
              onClick={() => setSelectedComponentId(component.id!)}
            >
              {component.name}
            </Button>
          ))}
        </Stack>

        {selectedComponent && selectedComponent.choices.length > 1 && (
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              Select Choice:
            </Text>
            {selectedComponent.choices.map((choice, index) => (
              <Button
                key={choice.id}
                variant={selectedChoiceIndex === index ? 'filled' : 'outline'}
                size="xs"
                onClick={() => setSelectedChoiceIndex(index)}
              >
                {choice.name}
              </Button>
            ))}
          </Stack>
        )}

        <Stack gap="xs">
          <Text size="sm" fw={500}>
            Actions:
          </Text>
          <Button
            onClick={handleRenderComponent}
            disabled={!selectedComponentId || !renderContext}
            size="sm"
          >
            Render Component
          </Button>
          <Button onClick={handleClearCanvas} variant="outline" size="sm" disabled={!renderContext}>
            Clear Canvas
          </Button>
        </Stack>
      </Group>

      <Box
        style={{
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          display: 'inline-block',
          overflow: 'hidden',
        }}
      >
        <canvas ref={canvasElRef} />
      </Box>

      {selectedComponent && (
        <Box>
          <Text size="sm" c="dimmed">
            Component: {selectedComponent.name}
            {selectedComponent.description && ` - ${selectedComponent.description}`}
          </Text>
          {selectedComponent.choices[selectedChoiceIndex] && (
            <Text size="xs" c="dimmed">
              Choice: {selectedComponent.choices[selectedChoiceIndex].name}
            </Text>
          )}
        </Box>
      )}
    </Stack>
  );
}
