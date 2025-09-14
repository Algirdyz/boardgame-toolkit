import { useMemo, useState } from 'react';
import { ComponentStaticSpecs } from '@shared/components';
import { Variables } from '@shared/variables';
import { Badge, Box, Button, Group, Stack, Text } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { ComponentDict, useComponents } from '@/hooks/useComponents';
import useFabricCanvas from '@/hooks/useFabricCanvas';

interface ComponentCanvasProps {
  component: ComponentStaticSpecs;
  variables: Variables;
  otherComponents: ComponentStaticSpecs[];
}

export function ComponentCanvas({ component, variables, otherComponents }: ComponentCanvasProps) {
  const {
    ref: canvasContainerRef,
    width: containerWidth,
    height: containerHeight,
  } = useElementSize();
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(0);

  // Calculate canvas dimensions with some padding
  const canvasWidth = Math.max(400, containerWidth - 20);
  const canvasHeight = Math.max(300, containerHeight - 20);
  const { canvasHtmlRef, canvasRef } = useFabricCanvas(canvasWidth, canvasHeight);

  const allComponents = useMemo(() => {
    return [...otherComponents.filter((c) => c.id !== component.id), component];
  }, [otherComponents, component]);

  const thisComponent: ComponentDict = useMemo(() => {
    // Only create the component dict if we have a valid component ID
    if (!component?.id) return {} as ComponentDict;

    // Calculate center position based on canvas dimensions
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    return {
      targetComponent: {
        componentId: component.id,
        templateSpecs: {
          maxCount: 1,
          rows: 1,
          spacing: 0,
          position: {
            x: centerX,
            y: centerY,
            rotation: 0,
            scale: 1,
          },
        },
      },
    };
  }, [component?.id, canvasWidth, canvasHeight]);

  const componentChoices = useMemo(
    () => ({
      targetComponent: selectedChoiceIndex,
    }),
    [selectedChoiceIndex]
  );

  useComponents({
    canvasRef,
    allComponents,
    variables,
    allowInteraction: false,
    components: thisComponent,
    componentChoices,
  });

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
    </Stack>
  );
}
