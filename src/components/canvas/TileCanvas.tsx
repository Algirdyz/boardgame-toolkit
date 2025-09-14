import { useEffect } from 'react';
import { ComponentStaticSpecs } from '@shared/components';
import { TemplateDefinition } from '@shared/templates';
import { TileDefinition } from '@shared/tiles';
import { Variables } from '@shared/variables';
import { useCanvasInteractions } from '@/hooks/useCanvasInteractions';
import { useComponents } from '@/hooks/useComponents';
import useFabricCanvas from '@/hooks/useFabricCanvas';
import useTileShape from '@/hooks/useTileShape';
import { centerCanvasToBox } from '@/lib/fabricRenderer/canvasUtils';

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

  // Center the canvas when bounding box is available
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !tileShapeResult.boundingBox) return;

    centerCanvasToBox(canvas, tileShapeResult.boundingBox, canvasDims.width, canvasDims.height);
  }, [canvasRef, tileShapeResult.boundingBox, canvasDims]);

  return <canvas ref={canvasHtmlRef} />;
}
