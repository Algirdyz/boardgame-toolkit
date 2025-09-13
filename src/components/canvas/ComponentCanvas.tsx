import React, { useCallback, useEffect, useState } from 'react';
import { ComponentStaticSpecs } from '@shared/components';
import { Variables } from '@shared/variables';
import { ActionIcon, Badge, Box, Button, Group, Stack, Text } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconEye, IconEyeOff, IconRefresh } from '@tabler/icons-react';
import useFabricCanvas from '@/hooks/useFabricCanvas';
import {
  addComponentToCanvas,
  clearCanvas,
  ComponentRenderOptions,
  RenderContext,
} from '@/lib/fabricRenderer';

interface ComponentCanvasProps {
  component: ComponentStaticSpecs;
  variables: Variables;
  allComponents?: ComponentStaticSpecs[]; // For nested component rendering
}

export function ComponentCanvas({
  component,
  variables,
  allComponents = [],
}: ComponentCanvasProps) {
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
  const { canvasHtmlRef, canvasRef } = useFabricCanvas(canvasWidth, canvasHeight);

  // Create render context
  const renderContext: RenderContext | null = React.useMemo(() => {
    return {
      variables,
      components: [component, ...allComponents],
      scale: 1,
    };
  }, [variables, component, allComponents]);

  // Render component on canvas
  const renderComponent = useCallback(async () => {
    if (!canvasRef.current || !component.id) return;

    setRenderError(null);

    try {
      // Clear canvas first
      clearCanvas(canvasRef.current);

      // Calculate center position - ensure we have valid dimensions
      const canvasWidth = canvasRef.current.getWidth();
      const canvasHeight = canvasRef.current.getHeight();
      
      // Don't render if canvas doesn't have valid dimensions yet
      if (canvasWidth <= 0 || canvasHeight <= 0) {
        return;
      }
      
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
      await addComponentToCanvas(canvasRef.current, component.id, renderContext, renderOptions);
    } catch (error) {
      console.error('Error rendering component:', error);
      setRenderError(error instanceof Error ? error.message : 'Unknown rendering error');
    }
  }, [renderContext, component.id, selectedChoiceIndex, isInteractive]);

  // Re-render when dependencies change or when canvas dimensions are available
  useEffect(() => {
    if (renderContext && canvasWidth > 0 && canvasHeight > 0) {
      renderComponent();
    }
  }, [renderComponent, renderContext, canvasWidth, canvasHeight]);

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
        <canvas ref={canvasHtmlRef} />
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
