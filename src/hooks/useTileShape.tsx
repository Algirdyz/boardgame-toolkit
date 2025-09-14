import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GridPosition, TileShape } from '@shared/templates';
import * as fabric from 'fabric';
import { BoundingBox } from '@/components/canvas/canvasTypes';
import { adjacentColor, fillColor, strokeColor, TILE_SIZE } from '@/lib/constants';
import { generatePolygonVertices } from '@/lib/polygoner';
import { BaseTileShape, getTileShape } from '@/lib/tileSets/baseTileShape';

interface UseShapeGeneratorResult {
  occupiedSquares: Set<string>;
  adjacentAreas: Set<string>;
  addSquare: (position: GridPosition) => void;
  removeSquare: (position: GridPosition) => void;
  clearShape: () => void;
  isShapeValid: boolean;
  boundingBox: BoundingBox | null;
}

function createClickableSquare(
  canvas: fabric.Canvas | null,
  pos: GridPosition,
  addSquare: (position: GridPosition) => void,
  editLocked: boolean = false,
  tileShape: BaseTileShape
) {
  // Get vertices for the tile shape
  const vertices = tileShape.getAllVertices(pos);
  const fabricPoints = vertices.map((v) => new fabric.Point(v.x, v.y));

  // Create the shape outline using the tile shape
  const outline = new fabric.Polygon(fabricPoints, {
    fill: 'rgba(0,0,0,0)',
    stroke: strokeColor,
    strokeWidth: 1,
    strokeDashArray: [TILE_SIZE / 19, TILE_SIZE / 19],
    selectable: false,
    evented: !editLocked,
    hoverCursor: editLocked ? 'default' : 'pointer',
    objectCaching: false,
  });

  // Create plus sign lines (centered in the tile bounds)
  const bounds = outline.getBoundingRect();
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const plusSize = Math.min(bounds.width, bounds.height) * 0.3; // 30% of smaller dimension

  const horizontalLine = new fabric.Line(
    [centerX - plusSize / 2, centerY, centerX + plusSize / 2, centerY],
    {
      stroke: strokeColor,
      strokeWidth: 3,
      opacity: 0,
      selectable: false,
      evented: false,
      objectCaching: false,
    }
  );

  const verticalLine = new fabric.Line(
    [centerX, centerY - plusSize / 2, centerX, centerY + plusSize / 2],
    {
      stroke: strokeColor,
      strokeWidth: 3,
      opacity: 0,
      selectable: false,
      evented: false,
      objectCaching: false,
    }
  );

  // Create a group with all elements
  const group = new fabric.Group([outline, horizontalLine, verticalLine], {
    // left: worldPos.x,
    // top: worldPos.y,
    selectable: false,
    evented: !editLocked,
    hoverCursor: editLocked ? 'default' : 'pointer',
    objectCaching: false,
  });

  // Mark as shape-related for z-index management
  group.set('isShapeRelated', true);

  if (!editLocked) {
    group.on('mouseover', () => {
      outline.set('fill', adjacentColor);
      horizontalLine.set('opacity', 1);
      verticalLine.set('opacity', 1);
      canvas?.renderAll();
    });

    group.on('mouseout', () => {
      outline.set('fill', 'rgba(0,0,0,0)');
      horizontalLine.set('opacity', 0);
      verticalLine.set('opacity', 0);
      canvas?.renderAll();
    });

    group.on('mousedown', () => {
      addSquare(pos);
    });
  }

  return group;
}

function createPolygonalShape(points: GridPosition[], tileShape: BaseTileShape) {
  const vertices = generatePolygonVertices(points, tileShape);
  const fabricPoints = vertices.map((p) => new fabric.Point(p.x, p.y));
  const polygon = new fabric.Polygon(fabricPoints, {
    fill: fillColor,
    stroke: strokeColor,
    strokeWidth: 2,
    selectable: false,
    evented: false,
  });

  // Mark as shape-related for z-index management
  polygon.set('isShapeRelated', true);
  return polygon;
}

function panCanvasToObject(canvas: fabric.Canvas, object: fabric.Object): boolean {
  // Check if canvas is properly initialized
  if (!canvas.width || !canvas.height || canvas.width <= 0 || canvas.height <= 0) {
    return false; // Canvas not ready
  }

  const zoom = canvas.getZoom();
  const vpw = canvas.width / zoom;
  const vph = canvas.height / zoom;
  const center = object.getCenterPoint();
  const x = center.x - vpw / 2;
  const y = center.y - vph / 2;
  canvas.absolutePan(new fabric.Point(x, y));
  canvas.setZoom(zoom);
  return true; // Successfully panned
}

function createInvisibleTriggerSquare(
  canvas: fabric.Canvas | null,
  pos: GridPosition,
  removeSquare: (position: GridPosition) => void,
  editLocked: boolean = false,
  tileShape: BaseTileShape
) {
  // Get vertices for the tile shape
  const vertices = tileShape.getAllVertices(pos);
  const fabricPoints = vertices.map((v) => new fabric.Point(v.x, v.y));

  // Create invisible trigger area using the tile shape
  const triggerArea = new fabric.Polygon(fabricPoints, {
    left: 0,
    top: 0,
    fill: 'transparent',
    stroke: 'transparent',
    selectable: false,
    evented: !editLocked,
    hoverCursor: editLocked ? 'default' : 'pointer',
    objectCaching: false,
  });

  // Create X sign lines (centered in the tile bounds)
  const bounds = triggerArea.getBoundingRect();
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const xSize = Math.min(bounds.width, bounds.height) * 0.3; // 30% of smaller dimension

  const diagonalLine1 = new fabric.Line(
    [centerX - xSize / 2, centerY - xSize / 2, centerX + xSize / 2, centerY + xSize / 2],
    {
      stroke: strokeColor,
      strokeWidth: 3,
      opacity: 0,
      selectable: false,
      evented: false,
      objectCaching: false,
    }
  );

  const diagonalLine2 = new fabric.Line(
    [centerX - xSize / 2, centerY + xSize / 2, centerX + xSize / 2, centerY - xSize / 2],
    {
      stroke: strokeColor,
      strokeWidth: 3,
      opacity: 0,
      selectable: false,
      evented: false,
      objectCaching: false,
    }
  );

  // Create a group with all elements
  const group = new fabric.Group([triggerArea, diagonalLine1, diagonalLine2], {
    left: 0,
    top: 0,
    selectable: false,
    evented: !editLocked,
    hoverCursor: editLocked ? 'default' : 'pointer',
    objectCaching: false,
  });

  // Mark as shape-related for z-index management
  group.set('isShapeRelated', true);

  if (!editLocked) {
    group.on('mouseover', () => {
      diagonalLine1.set('opacity', 1);
      diagonalLine2.set('opacity', 1);
      canvas?.renderAll();
    });

    group.on('mouseout', () => {
      diagonalLine1.set('opacity', 0);
      diagonalLine2.set('opacity', 0);
      canvas?.renderAll();
    });

    group.on('mousedown', (e) => {
      const event = e.e as MouseEvent;
      event.preventDefault();
      removeSquare(pos);
    });
  }

  return group;
}

export default function useTileShape(
  canvas: fabric.Canvas | null,
  tileShape: TileShape,
  editLocked: boolean = false,
  onShapeChange?: (shape: TileShape) => void,
  enforceZOrder?: () => void
): UseShapeGeneratorResult {
  const [adjacentAreas, setAdjacentAreas] = useState<Set<string>>(new Set());
  const [boundingBox, setBoundingBox] = useState<BoundingBox | null>(null);
  const shapeObjectsRef = useRef<Map<string, fabric.Object>>(new Map());
  const adjacentObjectsRef = useRef<Map<string, fabric.Object>>(new Map());
  const hasInitiallyPannedRef = useRef<boolean>(false);

  // Create tile shape instance from the new TileShape
  const baseTileShape = useMemo(() => {
    const edgeCount = tileShape.type === 'hexagon' ? 6 : 4;
    return getTileShape(edgeCount, TILE_SIZE);
  }, [tileShape.type]);

  // Helper function to convert position to string key
  const positionKey = useCallback((pos: GridPosition): string => {
    return `${pos.x},${pos.y}`;
  }, []);

  // Helper function to convert string key to position
  const keyToPosition = useCallback((key: string): GridPosition => {
    const [x, y] = key.split(',').map(Number);
    return { x, y };
  }, []);

  const occupiedSquares = useMemo(() => {
    if (!tileShape.vertices || tileShape.vertices.length === 0) {
      return new Set<string>(['0,0']); // Default to single square at origin
    }
    const newSq = new Set<string>();
    for (const pos of tileShape.vertices) {
      newSq.add(positionKey(pos));
    }
    return newSq;
  }, [tileShape.vertices, positionKey]);

  // Update adjacent areas based on occupied squares
  const updateAdjacentAreas = useCallback(() => {
    const newAdjacent = new Set<string>();

    occupiedSquares.forEach((key) => {
      const pos = keyToPosition(key);
      const adjacentPositions = baseTileShape.getAllAdjacentPositions(pos);

      adjacentPositions.forEach((adjPos) => {
        const adjKey = positionKey(adjPos);
        if (!occupiedSquares.has(adjKey)) {
          newAdjacent.add(adjKey);
        }
      });
    });

    setAdjacentAreas(newAdjacent);
  }, [occupiedSquares, tileShape, keyToPosition, positionKey]);

  // Add a square to the shape
  const addSquare = useCallback(
    (position: GridPosition) => {
      if (!onShapeChange) return;
      if (editLocked) return; // Don't allow adding when edit is locked

      const key = positionKey(position);

      if (occupiedSquares.has(key)) {
        return; // Already occupied
      }

      // Check if the position is adjacent to existing squares
      if (occupiedSquares.size > 0) {
        const isAdjacent = Array.from(occupiedSquares).some((occupiedKey) => {
          const occupiedPos = keyToPosition(occupiedKey);
          const adjacentPositions = baseTileShape.getAllAdjacentPositions(occupiedPos);
          return adjacentPositions.some(
            (adjPos) => adjPos.x === position.x && adjPos.y === position.y
          );
        });

        if (!isAdjacent) {
          return; // Not adjacent to existing shape
        }
      }

      onShapeChange({
        ...tileShape,
        vertices: [...Array.from(occupiedSquares).map((key) => keyToPosition(key)), position],
      });
    },
    [editLocked, occupiedSquares, onShapeChange, positionKey, keyToPosition, tileShape]
  );

  // Remove a square from the shape
  const removeSquare = useCallback(
    (position: GridPosition) => {
      if (!onShapeChange) return;
      if (editLocked) return; // Don't allow removing when edit is locked

      const key = positionKey(position);

      if (!occupiedSquares.has(key) || occupiedSquares.size <= 1) {
        return; // Can't remove if not occupied or if it's the last square
      }

      // Check if removing this square would disconnect the shape
      const remainingSquares = new Set(occupiedSquares);
      remainingSquares.delete(key);

      // Simple connectivity check using BFS
      const isConnected = () => {
        if (remainingSquares.size === 0) return true;

        const visited = new Set<string>();
        const queue = [Array.from(remainingSquares)[0]];
        visited.add(queue[0]);

        while (queue.length > 0) {
          const currentKey = queue.shift()!;
          const currentPos = keyToPosition(currentKey);
          const adjacentPositions = baseTileShape.getAllAdjacentPositions(currentPos);

          adjacentPositions.forEach((adjPos) => {
            const adjKey = positionKey(adjPos);
            if (remainingSquares.has(adjKey) && !visited.has(adjKey)) {
              visited.add(adjKey);
              queue.push(adjKey);
            }
          });
        }

        return visited.size === remainingSquares.size;
      };

      if (isConnected()) {
        onShapeChange({
          ...tileShape,
          vertices: Array.from(remainingSquares).map((key) => keyToPosition(key)),
        });
      }
    },
    [editLocked, occupiedSquares, positionKey, keyToPosition, tileShape]
  );

  // Clear the entire shape
  const clearShape = useCallback(() => {
    if (!onShapeChange) return;
    if (editLocked) return; // Don't allow clearing when edit is locked
    onShapeChange({
      ...tileShape,
      vertices: [{ x: 0, y: 0 }],
    }); // Reset to single square at origin
  }, [editLocked, onShapeChange]);

  // Update bounding box whenever shape objects change
  const updateBoundingBox = useCallback(() => {
    if (!canvas) {
      setBoundingBox(null);
      return;
    }

    const shapeObjects = Array.from(shapeObjectsRef.current.values());
    if (shapeObjects.length === 0) {
      setBoundingBox(null);
      return;
    }

    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    shapeObjects.forEach((obj) => {
      const bounds = obj.getBoundingRect();
      minX = Math.min(minX, bounds.left);
      minY = Math.min(minY, bounds.top);
      maxX = Math.max(maxX, bounds.left + bounds.width);
      maxY = Math.max(maxY, bounds.top + bounds.height);
    });

    if (minX !== Infinity) {
      setBoundingBox({
        left: minX,
        top: minY,
        width: maxX - minX,
        height: maxY - minY,
        centerX: (minX + maxX) / 2,
        centerY: (minY + maxY) / 2,
      });
    } else {
      setBoundingBox(null);
    }
  }, [canvas]);

  // Check if current shape is valid (connected)
  const isShapeValid = occupiedSquares.size > 0;

  // Render shape on canvas
  useEffect(() => {
    if (!canvas) return;

    // Clear previous objects
    shapeObjectsRef.current.forEach((obj) => canvas.remove(obj));
    adjacentObjectsRef.current.forEach((obj) => canvas.remove(obj));
    shapeObjectsRef.current.clear();
    adjacentObjectsRef.current.clear();

    // Create the main polygon shape
    if (occupiedSquares.size > 0) {
      const polygon = createPolygonalShape(
        Array.from(occupiedSquares).map((key) => keyToPosition(key)),
        baseTileShape
      );
      canvas.add(polygon);

      // Only pan to object once on initial load, but retry if canvas wasn't ready
      if (!hasInitiallyPannedRef.current) {
        const panSucceeded = panCanvasToObject(canvas, polygon);
        if (panSucceeded) {
          hasInitiallyPannedRef.current = true;
        }
      }

      shapeObjectsRef.current.set('polygon', polygon);
    }

    // Create invisible trigger squares for each occupied position
    occupiedSquares.forEach((key) => {
      const pos = keyToPosition(key);
      const triggerSquare = createInvisibleTriggerSquare(
        canvas,
        pos,
        removeSquare,
        editLocked,
        baseTileShape
      );
      canvas.add(triggerSquare);
      shapeObjectsRef.current.set(key, triggerSquare);
    });

    // Render adjacent clickable areas (only if not edit locked)
    if (!editLocked) {
      adjacentAreas.forEach((key) => {
        const pos = keyToPosition(key);
        const square = createClickableSquare(canvas, pos, addSquare, editLocked, baseTileShape);
        canvas.add(square);
        canvas.renderAll();
        adjacentObjectsRef.current.set(key, square);
      });
    }

    canvas.renderAll();

    // Enforce z-order after rendering shape elements
    if (enforceZOrder) {
      enforceZOrder();
    }

    // Update bounding box after all objects are rendered
    updateBoundingBox();
  }, [
    canvas,
    occupiedSquares,
    adjacentAreas,
    keyToPosition,
    addSquare,
    removeSquare,
    editLocked,
    enforceZOrder,
    updateBoundingBox,
    tileShape.type,
    baseTileShape,
  ]);

  // Update adjacent areas when occupied squares change
  useEffect(() => {
    updateAdjacentAreas();
  }, [updateAdjacentAreas]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (canvas) {
        shapeObjectsRef.current.forEach((obj) => canvas.remove(obj));
        adjacentObjectsRef.current.forEach((obj) => canvas.remove(obj));
      }
    };
  }, [canvas]);

  return {
    occupiedSquares,
    adjacentAreas,
    addSquare,
    removeSquare,
    clearShape,
    isShapeValid,
    boundingBox,
  };
}
