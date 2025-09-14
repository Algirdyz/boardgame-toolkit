import { useEffect, useRef, useState } from 'react';
import { CellType, MapCell, MapDefinition } from '@shared/maps';
import { useQuery } from '@tanstack/react-query';
import * as fabric from 'fabric';
import { CellTypePalette } from './CellTypePalette';
import {
  createGridLine,
  createInteractiveCell,
  setupCellHoverEffects,
  updateCellVisual,
  type TileCoord,
} from './mapCanvasUtils';
import { getVariables } from '@/api/variablesApi';
import { useCanvasInteractions } from '@/hooks/useCanvasInteractions';
import useFabricCanvas from '@/hooks/useFabricCanvas';
import { TILE_SIZE } from '@/lib/constants';
import { getTileShape } from '@/lib/tileSets/baseTileShape';

type Vertex = { x: number; y: number };
type Edge = { from: Vertex; to: Vertex };

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

export function MapCanvas({ map, width, height, onMapChange }: MapCanvasProps) {
  // Store tile coordinates for future use
  const tileCoordinatesRef = useRef<TileCoord[]>([]);

  // Store interactive cell objects for cleanup - keyed by "x,y"
  const interactiveCellsRef = useRef<Map<string, fabric.Group>>(new Map());

  // Store grid lines separately
  const gridLinesRef = useRef<fabric.Line[]>([]);

  // Active cell type for painting
  const [activeCellType, setActiveCellType] = useState<CellType | null>(null);

  // Drag painting state
  const [isDragging, setIsDragging] = useState(false);
  const lastPaintedCellRef = useRef<{ x: number; y: number } | null>(null);

  // Load variables for color rendering
  const { data: variables } = useQuery({
    queryKey: ['variables'],
    queryFn: getVariables,
  });

  const colors = variables?.colors || [];

  const { canvasHtmlRef, canvasRef } = useFabricCanvas(width, height, {
    showGrid: false,
    gridSize: 50,
    gridColor: '#e0e0e0',
  });

  // Define all the functions as consts
  const getCellByCoord = (x: number, y: number): MapCell | undefined => {
    return map.cells?.find((cell) => cell.x === x && cell.y === y);
  };

  const getCellTypeColor = (cellType: CellType): string => {
    if (!cellType.colorId) return '#e9ecef';
    const color = colors.find((c) => c.id === cellType.colorId);
    return color?.value || '#e9ecef';
  };

  const getCellTypeById = (id: string): CellType | undefined => {
    return map.cellTypes?.find((ct) => ct.id === id);
  };

  const getActiveCellType = (): CellType | null => {
    return activeCellType;
  };

  const handleCellClick = (x: number, y: number) => {
    paintCell(x, y);
    setIsDragging(true);
    lastPaintedCellRef.current = { x, y };
  };

  const handleCellDrag = (x: number, y: number) => {
    // Only paint if we're dragging and this is a different cell than the last one painted
    if (!isDragging) return;
    if (lastPaintedCellRef.current?.x === x && lastPaintedCellRef.current?.y === y) return;
    // Update visual immediately without triggering full re-render
    updateCellVisualDirectly(x, y);
    lastPaintedCellRef.current = { x, y };
  };

  const updateCellVisualDirectly = (x: number, y: number) => {
    const cellKey = `${x},${y}`;
    const interactiveCell = interactiveCellsRef.current.get(cellKey);
    if (!interactiveCell) return;

    if (activeCellType) {
      // Apply the cell type color directly to the fabric object
      const color = getCellTypeColor(activeCellType);
      const cellFill = (interactiveCell as any).cellFill;
      cellFill.set({
        fill: color,
        opacity: 0.7,
      });
    } else {
      // Erase mode - make cell transparent
      const cellFill = (interactiveCell as any).cellFill;
      cellFill.set({
        fill: 'rgba(0,0,0,0)',
        opacity: 0,
      });
    }

    // Update the actual data in background (this will eventually sync the state)
    paintCell(x, y);

    // Render the canvas
    const canvas = canvasRef.current;
    if (canvas) canvas.renderAll();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    lastPaintedCellRef.current = null;
  };

  const paintCell = (x: number, y: number) => {
    if (!onMapChange) return;

    const cells = map.cells || [];
    const existingCellIndex = cells.findIndex((cell) => cell.x === x && cell.y === y);

    let updatedCells;
    if (activeCellType) {
      // Add or update cell with new type
      const newCell: MapCell = { x, y, cellTypeId: activeCellType.id };
      if (existingCellIndex >= 0) {
        updatedCells = [...cells];
        updatedCells[existingCellIndex] = newCell;
      } else {
        updatedCells = [...cells, newCell];
      }
    } else if (existingCellIndex >= 0) {
      // Remove cell (erase mode)
      updatedCells = cells.filter((_, index) => index !== existingCellIndex);
    } else {
      // No cell to remove, no change needed
      return;
    }

    const updatedMap = {
      ...map,
      cells: updatedCells,
    };

    onMapChange(updatedMap);
  };

  // Create a refs object to hold all the functions that need to stay current
  const functionsRef = useRef({
    getCellByCoord,
    getCellTypeColor,
    getCellTypeById,
    getActiveCellType,
    handleCellClick,
    handleCellDrag,
    handleDragEnd,
    paintCell,
    updateCellVisualDirectly,
  });

  // Update the functions ref whenever dependencies change
  useEffect(() => {
    functionsRef.current = {
      getCellByCoord,
      getCellTypeColor,
      getCellTypeById,
      getActiveCellType,
      handleCellClick,
      handleCellDrag,
      handleDragEnd,
      paintCell,
      updateCellVisualDirectly,
    };
  }, [
    getCellByCoord,
    getCellTypeColor,
    getCellTypeById,
    getActiveCellType,
    handleCellClick,
    handleCellDrag,
    handleDragEnd,
    paintCell,
    updateCellVisualDirectly,
  ]);

  useCanvasInteractions({
    canvasRef,
    panEnabled: true,
    zoomEnabled: true,
  });

  // Add global mouse up listener to end drag painting
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleDragEnd();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, handleDragEnd]);

  // Effect 1: Create grid and interactive cells (only when dimensions change)
  useEffect(() => {
    console.log('MapCanvas: Rebuilding grid and interactive cells due to dimension change');
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Clear canvas and references
    canvas.clear();
    interactiveCellsRef.current.clear();
    gridLinesRef.current = [];

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

    // Collect all unique vertices and edges for grid lines
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

    // Draw all unique edges as grid lines
    edgesMap.forEach((edge) => {
      const line = createGridLine(edge.from.x, edge.from.y, edge.to.x, edge.to.y);
      canvas.add(line);
      gridLinesRef.current.push(line);
    });

    // Create interactive cells
    tileCoords.forEach((tileCoord) => {
      const cellKey = `${tileCoord.x},${tileCoord.y}`;
      const interactiveCell = createInteractiveCell(tileCoord, squareTileShape, startX, startY);

      // Store reference for updates
      interactiveCellsRef.current.set(cellKey, interactiveCell);

      // Set up hover effects using the utils function to avoid closure issues
      setupCellHoverEffects(interactiveCell, canvas, functionsRef);

      canvas.add(interactiveCell);
    });

    canvas.renderAll();
  }, [canvasRef, map.dimensions.width, map.dimensions.height, map.tileShape]);

  // Effect 2: Update cell visuals when cell data or cell types change
  useEffect(() => {
    console.log('MapCanvas: Updating cell visuals due to map.cells or map.cellTypes change');
    const canvas = canvasRef.current;
    if (!canvas || interactiveCellsRef.current.size === 0) return;

    // Update visual state of all cells based on current map data
    tileCoordinatesRef.current.forEach((tileCoord) => {
      const cellKey = `${tileCoord.x},${tileCoord.y}`;
      const interactiveCell = interactiveCellsRef.current.get(cellKey);
      const currentCell = functionsRef.current.getCellByCoord(tileCoord.x, tileCoord.y);

      if (interactiveCell) {
        if (currentCell) {
          const cellType = map.cellTypes?.find((ct) => ct.id === currentCell.cellTypeId);
          updateCellVisual(
            interactiveCell,
            cellType || null,
            functionsRef.current.getCellTypeColor
          );
        } else {
          updateCellVisual(interactiveCell, null, functionsRef.current.getCellTypeColor);
        }
      }
    });

    canvas.renderAll();
  }, [map.cells, map.cellTypes, colors]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Cell Type Palette - positioned outside canvas but overlaying */}
      {(map.cellTypes?.length || 0) > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            pointerEvents: 'auto',
          }}
        >
          <CellTypePalette
            cellTypes={map.cellTypes || []}
            activeCellType={activeCellType}
            onCellTypeSelect={setActiveCellType}
          />
        </div>
      )}

      {/* Canvas container */}
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <canvas ref={canvasHtmlRef} style={{ display: 'block' }} />
      </div>
    </div>
  );
}
