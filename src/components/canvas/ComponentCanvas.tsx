import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ComponentStaticSpecs } from '@shared/components';
import { GlobalVariables } from '@shared/globals';
import { ActionIcon, Badge, Box, Button, Group, Stack, Text } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconEye, IconEyeOff, IconRefresh } from '@tabler/icons-react';
import * as fabric from 'fabric';
import {
  addComponentToCanvas,
  clearCanvas,
  ComponentRenderOptions,
  RenderContext,
} from '@/lib/fabricRenderer';

interface ComponentCanvasProps {
  component: ComponentStaticSpecs;
  globalVariables: GlobalVariables;
  allComponents?: ComponentStaticSpecs[]; // For nested component rendering
}

export function ComponentCanvas({
  component,
  globalVariables,
  allComponents = [],
}: ComponentCanvasProps) {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const {
    ref: canvasContainerRef,
    width: containerWidth,
    height: containerHeight,
  } = useElementSize();
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(0);
  const [isInteractive, setIsInteractive] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);

  // Calculate canvas dimensions with some padding
  const canvasWidth = Math.max(400, containerWidth - 20);
  const canvasHeight = Math.max(300, containerHeight - 20);

  // Initialize canvas and handle resizing
  useEffect(() => {
    if (!canvasElRef.current || canvasWidth === 0 || canvasHeight === 0) return;

    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: '#ffffff',
      selection: isInteractive,
    });

    canvasRef.current = canvas;

    return () => {
      canvas.dispose();
      canvasRef.current = null;
    };
  }, [canvasWidth, canvasHeight, isInteractive]);

  // Create render context
  const renderContext: RenderContext | null = React.useMemo(() => {
    if (!canvasRef.current) return null;

    return {
      canvas: canvasRef.current,
      globalVariables,
      components: [component, ...allComponents],
      scale: 1,
    };
  }, [globalVariables, component, allComponents]);

  // Render component on canvas
  const renderComponent = useCallback(async () => {
    if (!renderContext || !component.id) return;

    setRenderError(null);

    try {
      // Clear canvas first
      clearCanvas(renderContext.canvas);

      // Calculate center position
      const canvasWidth = renderContext.canvas.getWidth();
      const canvasHeight = renderContext.canvas.getHeight();
      const centerX = canvasWidth / 2;
      const centerY = canvasHeight / 2;

      const renderOptions: ComponentRenderOptions = {
        position: {
          x: centerX,
          y: centerY,
          rotation: 0,
          scale: 1,
        },
        choiceIndex: selectedChoiceIndex,
        allowInteraction: isInteractive,
      };

      // Add component to canvas
      await addComponentToCanvas(component.id, renderContext, renderOptions);
    } catch (error) {
      console.error('Error rendering component:', error);
      setRenderError(error instanceof Error ? error.message : 'Unknown rendering error');
    }
  }, [renderContext, component.id, selectedChoiceIndex, isInteractive]);

  // Re-render when dependencies change
  useEffect(() => {
    if (renderContext) {
      renderComponent();
    }
  }, [renderComponent, renderContext]);

  const handleRefresh = () => {
    renderComponent();
  };

  const toggleInteractive = () => {
    setIsInteractive(!isInteractive);
  };

  const handleChoiceChange = (index: number) => {
    setSelectedChoiceIndex(index);
  };

  if (!component) {
    return (
      <Box p="md">
        <Text c="dimmed">No component to display</Text>
      </Box>
    );
  }

  const currentChoice = component.choices[selectedChoiceIndex];

  return (
    <Stack gap="sm" p="md" h="100%" style={{ overflow: 'hidden' }}>
      {/* Controls */}
      <Group justify="space-between" style={{ flexShrink: 0 }}>
        <Group gap="sm">
          <Text size="lg" fw={600}>
            Canvas Preview
          </Text>
          <Badge size="sm" variant="light">
            {component.name}
          </Badge>
        </Group>

        <Group gap="sm">
          <ActionIcon
            variant={isInteractive ? 'filled' : 'light'}
            color={isInteractive ? 'blue' : 'gray'}
            onClick={toggleInteractive}
            title={isInteractive ? 'Disable interaction' : 'Enable interaction'}
          >
            {isInteractive ? <IconEye size={16} /> : <IconEyeOff size={16} />}
          </ActionIcon>

          <Button
            size="xs"
            variant="light"
            leftSection={<IconRefresh size={14} />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Group>
      </Group>

      {/* Choice selector */}
      <Group gap="xs" style={{ flexShrink: 0 }}>
        <Text size="sm" fw={500}>
          Choice:
        </Text>
        {component.choices.map((choice, index) => (
          <Button
            key={choice.id}
            size="xs"
            variant={selectedChoiceIndex === index ? 'filled' : 'outline'}
            onClick={() => handleChoiceChange(index)}
          >
            {choice.name}
          </Button>
        ))}
      </Group>

      {/* Error display */}
      {renderError && (
        <Text size="sm" c="red" p="xs" bg="red.0" style={{ borderRadius: 4, flexShrink: 0 }}>
          Render Error: {renderError}
        </Text>
      )}

      {/* Canvas container - this should expand to fill remaining space */}
      <Box
        ref={canvasContainerRef}
        style={{
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f8f9fa',
          flex: 1, // This makes the canvas area expand to fill remaining space
          minHeight: 300, // Minimum height fallback
        }}
      >
        <canvas ref={canvasElRef} />
      </Box>

      {/* Info display */}
      <Stack gap="xs" style={{ flexShrink: 0 }}>
        {currentChoice && (
          <Group gap="md">
            <Text size="sm" c="dimmed">
              <strong>Choice:</strong> {currentChoice.name}
            </Text>
            {currentChoice.description && (
              <Text size="sm" c="dimmed">
                <strong>Description:</strong> {currentChoice.description}
              </Text>
            )}
          </Group>
        )}

        <Group gap="md">
          <Text size="xs" c="dimmed">
            Canvas: {canvasWidth} x {canvasHeight}
          </Text>
          <Text size="xs" c="dimmed">
            Interactive: {isInteractive ? 'Yes' : 'No'}
          </Text>
          <Text size="xs" c="dimmed">
            Choices: {component.choices.length}
          </Text>
        </Group>
      </Stack>
    </Stack>
  );
}
