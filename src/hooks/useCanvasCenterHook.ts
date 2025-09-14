import { useEffect, useRef } from 'react';
import { Canvas } from 'fabric';
import { BoundingBox } from '@/components/canvas/canvasTypes';
import { centerCanvasToBox } from '@/lib/fabricRenderer/canvasUtils';

export interface CanvasDims {
  width: number;
  height: number;
}
export default function useCanvasCenter(
  canvasRef: React.RefObject<Canvas | null>,
  bbox: BoundingBox | null,
  canvasDims: CanvasDims,
  keepCentered: boolean = false
) {
  const alreadyCenteredRef = useRef(false);

  // Center the canvas when bounding box is available
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !bbox) return;
    if (!keepCentered && alreadyCenteredRef.current) return;

    centerCanvasToBox(canvas, bbox, canvasDims.width, canvasDims.height);
    alreadyCenteredRef.current = true;
  }, [canvasRef, bbox, canvasDims]);
}
