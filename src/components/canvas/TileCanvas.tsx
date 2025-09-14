import { useEffect } from 'react';
import { ComponentStaticSpecs } from '@shared/components';
import { TemplateDefinition } from '@shared/templates';
import { TileDefinition } from '@shared/tiles';
import { Variables } from '@shared/variables';
import { useCanvasInteractions } from '@/hooks/useCanvasInteractions';
import { useComponents } from '@/hooks/useComponents';
import useFabricCanvas from '@/hooks/useFabricCanvas';
import useTileShape from '@/hooks/useTileShape';

interface TileCanvasProps {
  tile: TileDefinition;
  template: TemplateDefinition;
  components: ComponentStaticSpecs[];
  variables: Variables;
  width: number;
  height: number;
}

export default function TileCanvas({
  tile,
  template,
  components,
  variables,
  width,
  height,
}: TileCanvasProps) {
  const { canvasHtmlRef, canvasRef, canvasDims } = useFabricCanvas(width, height);

  // Disable interactions for tile preview
  useCanvasInteractions({
    canvasRef,
    panEnabled: false,
    zoomEnabled: false,
  });

  const tileShapeResult = useTileShape(canvasRef.current, template.shape, true);

  // Use the reusable components hook
  useComponents({
    canvasRef,
    allComponents: components,
    variables,
    components: template.components,
    componentChoices: tile.componentChoices,
    allowInteraction: false, // Tiles are for preview only
  });

  // Center the canvas when bounding boxes are available
  useEffect(() => {
    const canvas = canvasRef.current;
    console.log('tileShapeResult.boundingBox', tileShapeResult.boundingBox, canvas);
    if (!canvas) return;
    if (!tileShapeResult.boundingBox) return;

    //Center on shape center
    const shapeCenterX = tileShapeResult.boundingBox.centerX;
    const shapeCenterY = tileShapeResult.boundingBox.centerY;

    const canvasCenterX = canvasDims.width / 2;
    const canvasCenterY = canvasDims.height / 2;

    // Calculate viewport transform to center the content
    const viewportTransform = canvas.viewportTransform;
    if (viewportTransform) {
      viewportTransform[4] = canvasCenterX - shapeCenterX;
      viewportTransform[5] = canvasCenterY - shapeCenterY;
      canvas.setViewportTransform(viewportTransform);
      canvas.renderAll();
    }
  }, [canvasRef, tileShapeResult.boundingBox, canvasDims]);

  return <canvas ref={canvasHtmlRef} />;
}
