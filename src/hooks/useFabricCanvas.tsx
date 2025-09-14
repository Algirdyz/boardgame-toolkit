import { RefObject, useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { CanvasDims } from './useCanvasCenterHook';
import { useCanvasGrid } from './useCanvasGrid';

interface UseFabricCanvasOptions {
  showGrid?: boolean;
  gridSize?: number;
  gridColor?: string;
}

interface UseFabricCanvasResult {
  canvasHtmlRef: RefObject<HTMLCanvasElement | null>;
  canvasRef: RefObject<fabric.Canvas | null>;
  canvasDims: CanvasDims;
  isGridEnabled: boolean;
}

const useFabricCanvas = (
  width: number,
  height: number,
  options: UseFabricCanvasOptions = {}
): UseFabricCanvasResult => {
  const { showGrid = true, gridSize = 50, gridColor = '#e0e0e0' } = options;

  const canvasHtmlRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const [canvasDims, setCanvasDims] = useState({ width, height });

  // Initialize grid functionality
  const {
    updateGrid,
    setupGrid,
    isEnabled: isGridEnabled,
  } = useCanvasGrid(canvasRef, {
    enabled: showGrid,
    gridSize,
    color: gridColor,
    strokeWidth: 1,
    showLabels: true,
    labelColor: '#999999',
    labelSize: 12,
  });

  useEffect(() => {
    const canvasEl = canvasHtmlRef.current;
    if (!canvasEl) return;

    if (!canvasRef.current) {
      canvasRef.current = new fabric.Canvas(canvasEl, {
        width,
        height,
        selection: false,
        fireRightClick: true,
        stopContextMenu: true,
      });
    }
    setupGrid();

    return () => {
      canvasRef.current?.dispose();
      canvasRef.current = null;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.setDimensions({ width, height });
      setCanvasDims({ width, height });

      // Update grid when canvas dimensions change
      setTimeout(() => updateGrid(), 0);

      canvas.renderAll();
    }
  }, [width, height, updateGrid]);

  return {
    canvasHtmlRef,
    canvasRef,
    canvasDims,
    isGridEnabled,
  };
};

export default useFabricCanvas;
