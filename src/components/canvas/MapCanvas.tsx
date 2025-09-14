import { useEffect, useRef } from 'react';
import { MapDefinition } from '@shared/maps';
import * as fabric from 'fabric';
import { useCanvasInteractions } from '@/hooks/useCanvasInteractions';
import useFabricCanvas from '@/hooks/useFabricCanvas';
import { TILE_SIZE } from '@/lib/constants';
import { getTileShape } from '@/lib/tileSets/baseTileShape';

type Vertex = { x: number; y: number };
type Edge = { from: Vertex; to: Vertex };
type TileCoord = { x: number; y: number };

// Helper function to create a unique key for vertices
const vertexKey = (vertex: Vertex): string => `${vertex.x},${vertex.y}`;

// Helper function to create a unique key for edges (order-independent)
const edgeKey = (edge: Edge): string => {
  const fromKey = vertexKey(edge.from);
  const toKey = vertexKey(edge.to);
  return fromKey < toKey ? `${fromKey}-${toKey}` : `${toKey}-${fromKey}`;
};

interface MapCanvasProps {
  map: MapDefinition;
  width: number;
  height: number;
  onMapChange?: (map: MapDefinition) => void;
}

export function MapCanvas({ map, width, height }: MapCanvasProps) {
  // Store tile coordinates for future use
  const tileCoordinatesRef = useRef<TileCoord[]>([]);

  const { canvasHtmlRef, canvasRef } = useFabricCanvas(width, height, {
    showGrid: false,
    gridSize: 50,
    gridColor: '#e0e0e0',
  });

  useCanvasInteractions({
    canvasRef,
    panEnabled: true,
    zoomEnabled: true,
  });
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Clear canvas
    canvas.clear();

    // Only handle square tiles for now
    if (map.tileShape !== 'square') {
      // Add a placeholder text for non-square tiles
      const text = new fabric.Text(`${map.tileShape} tiles not yet implemented`, {
        left: 50,
        top: 50,
        fontSize: 16,
        fill: '#666',
        selectable: false,
      });
      canvas.add(text);
      canvas.renderAll();
      return;
    }

    const startX = 50;
    const startY = 180;
    const mapWidth = map.dimensions.width;
    const mapHeight = map.dimensions.height;

    // Create tile shape generator
    const squareTileShape = getTileShape(4, TILE_SIZE);

    // Collect all tile coordinates
    const tileCoords: TileCoord[] = [];
    for (let x = 0; x < mapWidth; x++) {
      for (let y = 0; y < mapHeight; y++) {
        tileCoords.push({ x, y });
      }
    }

    // Store tile coordinates in ref for future use
    tileCoordinatesRef.current = tileCoords;

    // Collect all unique vertices
    const verticesMap = new Map<string, Vertex>();
    const edgesMap = new Map<string, Edge>();

    tileCoords.forEach((tileCoord) => {
      const vertices = squareTileShape.getAllVertices(tileCoord);

      // Add vertices to map (automatically deduplicates)
      vertices.forEach((vertex) => {
        const offsetVertex = {
          x: vertex.x + startX,
          y: vertex.y + startY,
        };
        verticesMap.set(vertexKey(offsetVertex), offsetVertex);
      });

      // Generate edges for this tile and add to map
      for (let i = 0; i < vertices.length; i++) {
        const currentVertex = {
          x: vertices[i].x + startX,
          y: vertices[i].y + startY,
        };
        const nextVertex = {
          x: vertices[(i + 1) % vertices.length].x + startX,
          y: vertices[(i + 1) % vertices.length].y + startY,
        };

        const edge: Edge = { from: currentVertex, to: nextVertex };
        edgesMap.set(edgeKey(edge), edge);
      }
    });

    // Draw all unique edges as individual lines
    edgesMap.forEach((edge) => {
      const line = new fabric.Line([edge.from.x, edge.from.y, edge.to.x, edge.to.y], {
        stroke: '#ccc',
        strokeWidth: 1,
        selectable: false,
      });
      canvas.add(line);
    });

    canvas.renderAll();
  }, [canvasRef, map.dimensions.width, map.dimensions.height]);

  return <canvas ref={canvasHtmlRef} />;
}
