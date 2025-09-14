import { useEffect } from 'react';
import { MapDefinition } from '@shared/maps';
import * as fabric from 'fabric';
import useFabricCanvas from '@/hooks/useFabricCanvas';

interface MapCanvasProps {
  map: MapDefinition;
  width: number;
  height: number;
  onMapChange?: (map: MapDefinition) => void;
}

export function MapCanvas({ map, width, height }: MapCanvasProps) {
  const { canvasHtmlRef, canvasRef } = useFabricCanvas(width, height, {
    showGrid: true,
    gridSize: 50,
    gridColor: '#e0e0e0',
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Clear canvas
    canvas.clear();

    // Add a simple placeholder for the map
    const text = new fabric.Text(`Map: ${map.name}`, {
      left: 50,
      top: 50,
      fontSize: 24,
      fill: '#333',
      selectable: false,
    });

    const shapeText = new fabric.Text(`Tile Shape: ${map.tileShape}`, {
      left: 50,
      top: 100,
      fontSize: 16,
      fill: '#666',
      selectable: false,
    });

    const placeholderText = new fabric.Text('Map editor coming soon...', {
      left: 50,
      top: 150,
      fontSize: 14,
      fill: '#999',
      selectable: false,
    });

    canvas.add(text);
    canvas.add(shapeText);
    canvas.add(placeholderText);

    // Draw a simple grid pattern to show the tile shape
    if (map.tileShape === 'square') {
      for (let x = 0; x < 5; x++) {
        for (let y = 0; y < 3; y++) {
          const square = new fabric.Rect({
            left: 50 + x * 60,
            top: 200 + y * 60,
            width: 50,
            height: 50,
            fill: 'transparent',
            stroke: '#ccc',
            strokeWidth: 1,
            selectable: false,
          });
          canvas.add(square);
        }
      }
    } else {
      // Simple hexagon pattern
      for (let x = 0; x < 4; x++) {
        for (let y = 0; y < 3; y++) {
          const offsetX = y % 2 === 1 ? 30 : 0;
          const hexPoints = [];
          const centerX = 75 + x * 60 + offsetX;
          const centerY = 225 + y * 52;
          const radius = 25;

          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            hexPoints.push({
              x: centerX + Math.cos(angle) * radius,
              y: centerY + Math.sin(angle) * radius,
            });
          }

          const hexagon = new fabric.Polygon(hexPoints, {
            fill: 'transparent',
            stroke: '#ccc',
            strokeWidth: 1,
            selectable: false,
          });
          canvas.add(hexagon);
        }
      }
    }

    canvas.renderAll();
  }, [canvasRef, map]);

  return <canvas ref={canvasHtmlRef} />;
}
