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
  const { canvasHtmlRef, canvasRef } = useFabricCanvas(width, height);

  // Enable pan and zoom for better navigation
  useCanvasInteractions({
    canvasRef,
    panEnabled: true,
    zoomEnabled: true,
  });

  useTileShape(canvasRef.current, template.shape, true);

  // Use the reusable components hook
  useComponents({
    canvasRef,
    components,
    variables,
    templateComponents: template.components,
    componentChoices: tile.componentChoices,
    allowInteraction: false, // Tiles are for preview only
  });

  return <canvas ref={canvasHtmlRef} />;
}
