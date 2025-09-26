import { RefObject, useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { CanvasDims } from './useCanvasCenterHook';
import { useCanvasGrid } from './useCanvasGrid';

interface UseFabricCanvasOptions {
  showGrid?: boolean;
  gridSize?: number;
  gridColor?: string;
  backgroundColor?: string;
}

interface UseFabricCanvasResult {
  canvasHtmlRef: (element: HTMLCanvasElement | null) => void;
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
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);

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

  // Callback ref to track when canvas element is available
  const setCanvasHtmlRef = (element: HTMLCanvasElement | null) => {
    canvasHtmlRef.current = element;
    setCanvasElement(element);
  };

  // Initialize canvas when element becomes available
  useEffect(() => {
    if (!canvasElement || canvasRef.current) return;

    canvasRef.current = new fabric.Canvas(canvasElement, {
      width,
      height,
      selection: false,
      fireRightClick: true,
      stopContextMenu: true,
    });

    setupGrid();

    return () => {
      canvasRef.current?.dispose();
      canvasRef.current = null;
    };
  }, [canvasElement, width, height, setupGrid]);

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
    canvasHtmlRef: setCanvasHtmlRef,
    canvasRef,
    canvasDims,
    isGridEnabled,
  };
};

export default useFabricCanvas;
