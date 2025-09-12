import { useEffect, useRef } from 'react';
import { VariableColor, VariableShape } from '@shared/variables';
import { Box } from '@mantine/core';
import * as fabric from 'fabric';
import { createFabricShape } from '../../../lib/fabricRenderer/shapeFactory';

interface ShapePreviewProps {
  shape: VariableShape;
  width?: number;
  height?: number;
}

export function ShapePreview({ shape, width = 200, height = 150 }: ShapePreviewProps) {
  const canvasHtmlRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    const canvasEl = canvasHtmlRef.current;
    if (!canvasEl) return;

    if (!canvasRef.current) {
      canvasRef.current = new fabric.Canvas(canvasEl, {
        width,
        height,
        selection: false,
        fireRightClick: false,
        stopContextMenu: true,
        allowTouchScrolling: false,
        moveCursor: 'default',
        hoverCursor: 'default',
        defaultCursor: 'default',
        interactive: false,
      });

      // Disable all interactions
      canvasRef.current.forEachObject((obj) => {
        obj.selectable = false;
        obj.evented = false;
      });
    }

    return () => {
      canvasRef.current?.dispose();
      canvasRef.current = null;
    };
  }, [width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Clear the canvas
    canvas.clear();

    // Set a light background
    canvas.backgroundColor = '#f8f9fa';

    // If no shape, show empty state
    if (!shape || !shape.value) {
      canvas.renderAll();
      return;
    }

    // Use the fabric renderer to create the shape
    // Create a stroke-only color for preview (no fill)
    const strokeColor: VariableColor = {
      id: 0,
      name: 'Preview Stroke',
      value: '#4263eb',
      description: 'Preview stroke color',
    };

    createFabricShape(shape, undefined, strokeColor)
      .then((fabricObject) => {
        if (fabricObject) {
          // Scale the object to fit in the preview canvas
          const maxWidth = width * 0.8;
          const maxHeight = height * 0.8;

          // Get object bounds
          const objWidth = fabricObject.getScaledWidth();
          const objHeight = fabricObject.getScaledHeight();

          // Calculate scale factor
          const scale = Math.min(maxWidth / objWidth, maxHeight / objHeight, 1);

          fabricObject.scale(scale);
          fabricObject.set({
            left: width / 2,
            top: height / 2,
            originX: 'center',
            originY: 'center',
            selectable: false,
            evented: false,
            fill: 'transparent', // Ensure no fill
            stroke: '#4263eb', // Ensure visible stroke
            strokeWidth: 2, // Ensure visible stroke width
          });

          canvas.add(fabricObject);
          canvas.renderAll();
        } else {
          // Show error placeholder if shape creation failed
          addErrorPlaceholder(canvas, width, height);
        }
      })
      .catch((error) => {
        console.error('Error creating shape:', error);
        addErrorPlaceholder(canvas, width, height);
      });
  }, [shape, width, height, canvasRef]);

  return (
    <Box
      style={{
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'inline-block',
      }}
    >
      <canvas ref={canvasHtmlRef} />
    </Box>
  );
}

function addErrorPlaceholder(canvas: fabric.Canvas, canvasWidth: number, canvasHeight: number) {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  // Add error text
  const errorText = new fabric.Text('Preview\nUnavailable', {
    left: centerX,
    top: centerY,
    originX: 'center',
    originY: 'center',
    fontSize: 14,
    fill: '#6c757d',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    selectable: false,
    evented: false,
  });

  canvas.add(errorText);
  canvas.renderAll();
}
