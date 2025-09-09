import {
  Point,
  Rect,
  type Canvas,
  type TPointerEvent,
  type TPointerEventInfo,
} from "fabric";
import { useEffect, useRef } from "react";

interface UseCanvasInteractionsProps {
  canvasRef: React.RefObject<Canvas | null>;
  onViewportChange?: (newState: {
    viewport: [number, number, number, number, number, number];
    vpCenter: Point | null;
  }) => void;
  panEnabled?: boolean;
  zoomEnabled?: boolean;
  onMouseMove?: (x: number, y: number) => void;
}

export function useCanvasInteractions({
  canvasRef,
  onViewportChange,
  panEnabled = true,
  zoomEnabled = true,
  onMouseMove = undefined,
}: UseCanvasInteractionsProps) {
  const dragging = useRef(false);
  const lastPos = useRef<Point | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (opt: TPointerEventInfo<TPointerEvent>) => {
      const scenePoint = canvas.getScenePoint(opt.e);
      onMouseMove?.(scenePoint.x, scenePoint.y);
    };

    if (onMouseMove) {
      canvas.on("mouse:move", handleMouseMove);
    }

    return () => {
      canvas.off("mouse:move", handleMouseMove);
    };
  }, [onMouseMove]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCursor = (grabbing: boolean) => {
      if (zoomEnabled && canvas.getZoom() > 1) {
        canvas.setCursor(grabbing ? "grabbing" : "grab");
      } else {
        canvas.setCursor("default");
      }
    };

    const updateAndSetState = () => {
      if (onViewportChange) {
        onViewportChange({
          viewport: [...canvas.viewportTransform],
          vpCenter: canvas.getVpCenter(),
        });
      }

      canvas.requestRenderAll();
    };

    // ZOOM LOGIC
    const handleZoom = (opt: TPointerEventInfo<WheelEvent>) => {
      if (!zoomEnabled) return;
      const point = new Point(opt.e.offsetX, opt.e.offsetY);
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom() * 0.999 ** delta;
      zoom = Math.max(1, Math.min(20, zoom)); // Clamp zoom

      canvas.zoomToPoint(point, zoom);

      // Update stroke width on all objects
      canvas.getObjects().forEach((obj) => {
        if (obj instanceof Rect) {
          obj.set("strokeWidth", 1 / zoom);
        }
      });

      updateAndSetState();
      opt.e.preventDefault();
      opt.e.stopPropagation();
    };

    // PAN LOGIC
    const handleMouseDown = (opt: TPointerEventInfo<TPointerEvent>) => {
      if (!panEnabled || opt.target?.selectable) return;
      dragging.current = true;
      updateCursor(true);
    };

    const handleMouseMove = (opt: TPointerEventInfo<TPointerEvent>) => {
      if (!panEnabled || !dragging.current || opt.target?.selectable) return;
      if (!(opt.e instanceof MouseEvent)) return;

      if (!lastPos.current) {
        lastPos.current = new Point(opt.e.clientX, opt.e.clientY);
        return;
      }

      const vpt = canvas.viewportTransform!;
      vpt[4] += opt.e.clientX - lastPos.current.x;
      vpt[5] += opt.e.clientY - lastPos.current.y;

      lastPos.current = new Point(opt.e.clientX, opt.e.clientY);
      updateAndSetState();
    };

    const handleMouseUp = () => {
      if (!panEnabled) return;
      dragging.current = false;
      lastPos.current = null;
      updateCursor(false);
    };

    canvas.on("mouse:wheel", handleZoom);
    canvas.on("mouse:down", handleMouseDown);
    canvas.on("mouse:move", handleMouseMove);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      if ((canvas as any).__eventListeners) {
        canvas.off("mouse:wheel", handleZoom);
        canvas.off("mouse:down", handleMouseDown);
        canvas.off("mouse:move", handleMouseMove);
        canvas.off("mouse:up", handleMouseUp);
      }
    };
  }, [canvasRef, panEnabled, zoomEnabled]);
}