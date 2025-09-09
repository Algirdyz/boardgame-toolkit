import { useRef, useEffect, RefObject } from 'react';
import * as fabric from 'fabric';

interface UseFabricCanvasResult {
  canvasHtmlRef: RefObject<HTMLCanvasElement | null>;
  canvasRef: RefObject<fabric.Canvas | null>;
}

const useFabricCanvas = (width: number, height: number): UseFabricCanvasResult => {
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
        fireRightClick: true,
        stopContextMenu: true,
      });

      // Set the coordinate system so (0, 0) is in the center
      const canvas = canvasRef.current;
      const centerX = width / 2;
      const centerY = height / 2;
      canvas.setViewportTransform([1, 0, 0, 1, centerX, centerY]);
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
      canvas.renderAll();
    }
  }, [width, height]);

  return { canvasHtmlRef, canvasRef };
};

export default useFabricCanvas;