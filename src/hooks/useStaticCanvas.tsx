import { RefObject, useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

interface UseFabricCanvasResult {
  canvasHtmlRef: (element: HTMLCanvasElement | null) => void;
  canvasRef: RefObject<fabric.StaticCanvas | null>;
  canvasDims: { width: number; height: number };
}

const useStaticCanvas = (width: number, height: number): UseFabricCanvasResult => {
  const canvasHtmlRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<fabric.StaticCanvas | null>(null);
  const [canvasDims, setCanvasDims] = useState({ width, height });
  const [canvasElement, setCanvasElement] = useState<HTMLCanvasElement | null>(null);

  // Callback ref to track when canvas element is available
  const setCanvasHtmlRef = (element: HTMLCanvasElement | null) => {
    canvasHtmlRef.current = element;
    setCanvasElement(element);
  };

  // Initialize canvas when element becomes available
  useEffect(() => {
    if (!canvasElement || canvasRef.current) return;

    canvasRef.current = new fabric.StaticCanvas(canvasElement, {
      width,
      height,
    });

    return () => {
      canvasRef.current?.dispose();
      canvasRef.current = null;
    };
  }, [canvasElement, width, height]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.setDimensions({ width, height });
      setCanvasDims({ width, height });

      canvas.renderAll();
    }
  }, [width, height]);

  return {
    canvasHtmlRef: setCanvasHtmlRef,
    canvasRef,
    canvasDims,
  };
};

export default useStaticCanvas;
