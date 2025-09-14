import { useCallback, useEffect, useRef } from 'react';
import * as fabric from 'fabric';

interface UseCanvasGridOptions {
  enabled?: boolean;
  gridSize?: number; // Base grid size in pixels
  color?: string;
  strokeWidth?: number;
  showLabels?: boolean;
  labelColor?: string;
  labelSize?: number;
}

interface UseCanvasGridResult {
  updateGrid: () => void;
  setupGrid: () => void;
  isEnabled: boolean;
}

interface RelevantCanvasInfo {
  zoom: number;
  vpt: number[];
  vptCoords: fabric.TCornerPoint; // Optional precomputed viewport coordinates
}

function compareCanvasInfo(a: RelevantCanvasInfo | null, b: RelevantCanvasInfo): boolean {
  if (!a) return false;
  if (a.zoom !== b.zoom) return false;
  if (a.vpt.length !== b.vpt.length) return false;
  for (let i = 0; i < a.vpt.length; i++) {
    if (a.vpt[i] !== b.vpt[i]) return false;
  }

  if (a.vptCoords.bl.x !== b.vptCoords.bl.x || a.vptCoords.bl.y !== b.vptCoords.bl.y) return false;
  if (a.vptCoords.br.x !== b.vptCoords.br.x || a.vptCoords.br.y !== b.vptCoords.br.y) return false;
  if (a.vptCoords.tl.x !== b.vptCoords.tl.x || a.vptCoords.tl.y !== b.vptCoords.tl.y) return false;
  if (a.vptCoords.tr.x !== b.vptCoords.tr.x || a.vptCoords.tr.y !== b.vptCoords.tr.y) return false;
  return true;
}

export function useCanvasGrid(
  canvasRef: React.RefObject<fabric.Canvas | null>,
  options: UseCanvasGridOptions = {}
): UseCanvasGridResult {
  const {
    enabled = true,
    gridSize = 50,
    color = '#e0e0e0',
    strokeWidth = 1,
    showLabels = true,
    labelColor = '#999999',
    labelSize = 12,
  } = options;

  const gridObjectsRef = useRef<fabric.Object[]>([]);
  const isEnabledRef = useRef(enabled);
  const gridRenderTimerRef = useRef<NodeJS.Timeout | null>(null);

  const lastCanvasInfo = useRef<RelevantCanvasInfo | null>(null);

  const clearGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    gridObjectsRef.current.forEach((obj) => {
      canvas.remove(obj);
    });
    gridObjectsRef.current = [];
  }, [canvasRef]);

  const createGrid = useCallback(() => {
    console.log('Creating grid');
    const canvas = canvasRef.current;
    if (!canvas || !isEnabledRef.current) return;

    clearGrid();

    const zoom = canvas.getZoom();
    const vpt = canvas.viewportTransform!;
    const canvasWidth = canvas.width!;
    const canvasHeight = canvas.height!;

    // Calculate the visible area in world coordinates
    const leftWorld = -vpt[4] / zoom;
    const topWorld = -vpt[5] / zoom;
    const rightWorld = (canvasWidth - vpt[4]) / zoom;
    const bottomWorld = (canvasHeight - vpt[5]) / zoom;

    // Adjust grid spacing based on zoom level for better visibility
    let adjustedGridSize = gridSize;
    while (adjustedGridSize * zoom < 20) {
      adjustedGridSize *= 2;
    }
    while (adjustedGridSize * zoom > 100) {
      adjustedGridSize /= 2;
    }

    // Calculate grid line positions
    const startX = Math.floor(leftWorld / adjustedGridSize) * adjustedGridSize;
    const startY = Math.floor(topWorld / adjustedGridSize) * adjustedGridSize;
    const endX = Math.ceil(rightWorld / adjustedGridSize) * adjustedGridSize;
    const endY = Math.ceil(bottomWorld / adjustedGridSize) * adjustedGridSize;

    // Create vertical lines
    for (let x = startX; x <= endX; x += adjustedGridSize) {
      const line = new fabric.Line(
        [x, topWorld - adjustedGridSize, x, bottomWorld + adjustedGridSize],
        {
          stroke: color,
          strokeWidth: strokeWidth / zoom, // Adjust stroke width for zoom
          selectable: false,
          evented: false,
          excludeFromExport: true,
        }
      );

      // Mark as grid element for z-index management
      (line as any).isGrid = true;
      canvas.add(line);
      gridObjectsRef.current.push(line);
    }

    // Create horizontal lines
    for (let y = startY; y <= endY; y += adjustedGridSize) {
      const line = new fabric.Line(
        [leftWorld - adjustedGridSize, y, rightWorld + adjustedGridSize, y],
        {
          stroke: color,
          strokeWidth: strokeWidth / zoom, // Adjust stroke width for zoom
          selectable: false,
          evented: false,
          excludeFromExport: true,
        }
      );

      // Mark as grid element for z-index management
      (line as any).isGrid = true;
      canvas.add(line);
      gridObjectsRef.current.push(line);
    }

    // Add grid labels if enabled
    if (showLabels) {
      const labelInterval = adjustedGridSize * 2; // Show labels every other grid line

      // Add horizontal labels (for X coordinates)
      for (let x = startX; x <= endX; x += labelInterval) {
        if (x === 0) continue; // Skip origin

        const label = new fabric.Text(x.toString(), {
          left: x,
          top: topWorld + 5,
          fontSize: labelSize / zoom,
          fill: labelColor,
          selectable: false,
          evented: false,
          excludeFromExport: true,
        });

        (label as any).isGrid = true;
        canvas.add(label);
        gridObjectsRef.current.push(label);
      }

      // Add vertical labels (for Y coordinates)
      for (let y = startY; y <= endY; y += labelInterval) {
        if (y === 0) continue; // Skip origin

        const label = new fabric.Text(y.toString(), {
          left: leftWorld + 5,
          top: y,
          fontSize: labelSize / zoom,
          fill: labelColor,
          selectable: false,
          evented: false,
          excludeFromExport: true,
        });

        (label as any).isGrid = true;
        canvas.add(label);
        gridObjectsRef.current.push(label);
      }

      // Add origin label
      const originLabel = new fabric.Text('0,0', {
        left: 5,
        top: 5,
        fontSize: labelSize / zoom,
        fill: labelColor,
        fontWeight: 'bold',
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });

      (originLabel as any).isGrid = true;
      canvas.add(originLabel);
      gridObjectsRef.current.push(originLabel);
    }

    // Send grid elements to back
    gridObjectsRef.current.forEach((obj) => {
      canvas.sendObjectToBack(obj);
    });

    canvas.requestRenderAll();
  }, [canvasRef, enabled, gridSize, color, strokeWidth, showLabels, labelColor, labelSize]);

  const updateGrid = useCallback(() => {
    if (isEnabledRef.current) {
      createGrid();
    }
  }, [createGrid]);

  // Set up event listeners for viewport changes
  const setupGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleViewportChange = () => {
      const zoom = canvas.getZoom();
      const vpt = canvas.viewportTransform;
      const vptCoords = canvas.vptCoords;
      if (compareCanvasInfo(lastCanvasInfo.current, { zoom, vpt, vptCoords })) {
        return;
      }
      lastCanvasInfo.current = { zoom, vpt, vptCoords };
      // Debounce the grid update to avoid too frequent redraws
      if (gridRenderTimerRef.current) {
        return;
      }
      gridRenderTimerRef.current = setTimeout(() => {
        gridRenderTimerRef.current = null;
        if (isEnabledRef.current) {
          createGrid();
        }
      }, 16); // ~60fps
    };

    // Listen for viewport changes
    // canvas.on('after:render', handleViewportChange);

    // Initial grid creation
    if (isEnabledRef.current) {
      createGrid();
    }

    return () => {
      if (gridRenderTimerRef.current) {
        clearTimeout(gridRenderTimerRef.current);
      }
      canvas.off('after:render', handleViewportChange);
      clearGrid();
    };
  }, []);

  // Update enabled state when prop changes
  useEffect(() => {
    isEnabledRef.current = enabled;
    if (enabled) {
      createGrid();
    } else {
      clearGrid();
      canvasRef.current?.renderAll();
    }
  }, [enabled, createGrid, clearGrid]);

  return {
    updateGrid,
    setupGrid,
    isEnabled: isEnabledRef.current,
  };
}
