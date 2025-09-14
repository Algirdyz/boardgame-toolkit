import { RefObject, useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

interface UseFabricCanvasResult {
  canvasHtmlRef: RefObject<HTMLCanvasElement | null>;
  canvasRef: RefObject<fabric.Canvas | null>;
  canvasDims: { width: number; height: number };
}

const useFabricCanvas = (width: number, height: number): UseFabricCanvasResult => {
  const canvasHtmlRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const [canvasDims, setCanvasDims] = useState({ width, height });

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

      canvas.renderAll();
    }
  }, [width, height]);

  return { canvasHtmlRef, canvasRef, canvasDims };
};

export default useFabricCanvas;
