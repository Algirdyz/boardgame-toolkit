import { useEffect, useRef } from 'react';
import { Box } from '@mantine/core';
import * as fabric from 'fabric';

interface ShapePreviewProps {
  type: 'image' | 'svg' | 'simple-shape';
  value: string;
  width?: number;
  height?: number;
}

export function ShapePreview({ type, value, width = 200, height = 150 }: ShapePreviewProps) {
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

    // If no value, show empty state
    if (!value) {
      canvas.renderAll();
      return;
    }

    switch (type) {
      case 'image': {
        fabric.FabricImage.fromURL(value)
          .then((img) => {
            // Scale image to fit canvas while maintaining aspect ratio
            const maxWidth = width * 0.8;
            const maxHeight = height * 0.8;
            const scale = Math.min(maxWidth / img.width!, maxHeight / img.height!);

            img.scale(scale);
            img.set({
              left: width / 2,
              top: height / 2,
              originX: 'center',
              originY: 'center',
              selectable: false,
              evented: false,
            });
            canvas.add(img);
            canvas.renderAll();
          })
          .catch((error) => {
            console.error('Error loading image:', error);
            // Show error placeholder
            addErrorPlaceholder(canvas, width, height);
          });
        break;
      }

      case 'svg': {
        try {
          fabric
            .loadSVGFromString(value)
            .then(({ objects, options }) => {
              const validObjects = objects.filter(
                (obj): obj is fabric.FabricObject => obj !== null
              );
              const svgGroup = fabric.util.groupSVGElements(validObjects, options);

              // Scale SVG to fit canvas
              const maxWidth = width * 0.8;
              const maxHeight = height * 0.8;
              const scale = Math.min(maxWidth / svgGroup.width!, maxHeight / svgGroup.height!);

              svgGroup.scale(scale);
              svgGroup.set({
                left: width / 2,
                top: height / 2,
                originX: 'center',
                originY: 'center',
                selectable: false,
                evented: false,
              });
              canvas.add(svgGroup);
              canvas.renderAll();
            })
            .catch((error) => {
              console.error('Error loading SVG:', error);
              addErrorPlaceholder(canvas, width, height);
            });
        } catch (error) {
          console.error('Error parsing SVG:', error);
          addErrorPlaceholder(canvas, width, height);
        }
        break;
      }

      case 'simple-shape': {
        addSimpleShape(canvas, value, width, height);
        break;
      }
    }
  }, [type, value, width, height, canvasRef]);

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

function addSimpleShape(
  canvas: fabric.Canvas,
  shape: string,
  canvasWidth: number,
  canvasHeight: number
) {
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const size = Math.min(canvasWidth, canvasHeight) * 0.6;

  let fabricObject: fabric.FabricObject;

  switch (shape) {
    case 'circle': {
      fabricObject = new fabric.Circle({
        radius: size / 2,
        stroke: '#4263eb',
        fill: '#f8f9fa',
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      });
      break;
    }

    case 'square': {
      fabricObject = new fabric.Rect({
        width: size,
        height: size,
        stroke: '#4263eb',
        fill: '#f8f9fa',
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      });
      break;
    }

    case 'rounded': {
      fabricObject = new fabric.Rect({
        width: size,
        height: size,
        stroke: '#4263eb',
        fill: '#f8f9fa',
        rx: size * 0.1,
        ry: size * 0.1,
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      });
      break;
    }

    case 'triangle': {
      fabricObject = new fabric.Triangle({
        width: size,
        height: size,
        stroke: '#4263eb',
        fill: '#f8f9fa',
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      });
      break;
    }

    case 'diamond': {
      fabricObject = new fabric.Rect({
        width: size * 0.7,
        height: size * 0.7,
        stroke: '#4263eb',
        fill: '#f8f9fa',
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
        angle: 45,
        selectable: false,
        evented: false,
      });
      break;
    }

    case 'star': {
      const points = [];
      const outerRadius = size / 2;
      const innerRadius = outerRadius * 0.4;

      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        points.push({
          x: centerX + radius * Math.cos(angle - Math.PI / 2),
          y: centerY + radius * Math.sin(angle - Math.PI / 2),
        });
      }

      fabricObject = new fabric.Polygon(points, {
        stroke: '#4263eb',
        fill: '#f8f9fa',
        selectable: false,
        evented: false,
      });
      break;
    }

    case 'hexagon': {
      const points = [];
      const radius = size / 2;

      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        points.push({
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        });
      }

      fabricObject = new fabric.Polygon(points, {
        stroke: '#4263eb',
        fill: '#f8f9fa',
        selectable: false,
        evented: false,
      });
      break;
    }

    default: {
      // Default to circle if shape not recognized
      fabricObject = new fabric.Circle({
        radius: size / 2,
        fill: '#6c757d',
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      });
    }
  }

  canvas.add(fabricObject);
  canvas.renderAll();
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
