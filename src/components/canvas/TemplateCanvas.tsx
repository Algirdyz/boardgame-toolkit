import { useCallback, useEffect } from 'react';
import { CanvasPosition, ComponentStaticSpecs } from '@shared/components';
import { TemplateDefinition, TileShape } from '@shared/templates';
import { Variables } from '@shared/variables';
import { useCanvasInteractions } from '@/hooks/useCanvasInteractions';
import { useComponents } from '@/hooks/useComponents';
import useFabricCanvas from '@/hooks/useFabricCanvas';
import useTileShape from '@/hooks/useTileShape';
import { centerCanvasToBox } from '@/lib/fabricRenderer/canvasUtils';

interface TemplateCanvasProps {
  width: number;
  height: number;
  template: TemplateDefinition;
  onTemplateChange: (template: TemplateDefinition) => void;
  editLocked: boolean;
  availableComponents: ComponentStaticSpecs[];
  variables: Variables;
}

export default function TemplateCanvas(props: TemplateCanvasProps) {
  const { template, onTemplateChange, width, height, editLocked, availableComponents, variables } =
    props;

  const { canvasHtmlRef, canvasRef, canvasDims } = useFabricCanvas(width, height);
  useCanvasInteractions({
    canvasRef,
    panEnabled: true,
    zoomEnabled: true,
  });

  const onComponentPositionChange = useCallback(
    (instanceId: string, position: CanvasPosition) => {
      // Update template when component position changes

      const updatedTemplate: TemplateDefinition = {
        ...template,
        components: {
          ...template.components,
          [instanceId]: {
            ...template.components[instanceId],
            templateSpecs: {
              ...template.components[instanceId].templateSpecs,
              position,
            },
          },
        },
      };
      onTemplateChange(updatedTemplate);
    },
    [template, onTemplateChange]
  );

  // Handle template components rendering and interaction
  // When editLocked=true: shape editing is disabled, components can be moved
  // When editLocked=false: shape editing is enabled, components are locked
  const { componentGroups } = useComponents({
    canvasRef,
    allComponents: availableComponents,
    variables,
    components: template.components,
    allowInteraction: editLocked, // When editLocked is true, components can be moved
    onComponentPositionChange,
  });

  // Bring components to front function
  const bringComponentsToFront = useCallback(() => {
    if (!canvasRef.current) return;

    componentGroups.forEach((group) => {
      canvasRef.current?.bringObjectToFront(group);
    });
    canvasRef.current.renderAll();
  }, [canvasRef, componentGroups]);

  // Handle shape generation (the tile outline)
  // When editLocked=true: shape editing is disabled
  // When editLocked=false: shape editing is enabled

  const onShapeChange = useCallback(
    (newShape: TileShape) => {
      const updatedTemplate: TemplateDefinition = { ...props.template, shape: newShape };
      onTemplateChange(updatedTemplate);
    },
    [props.template, onTemplateChange]
  );

  const tileShapeResult = useTileShape(
    canvasRef.current,
    template.shape,
    editLocked,
    onShapeChange,
    bringComponentsToFront // Ensure components stay in front after shape updates
  );

  // Center the canvas when bounding box is available
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !tileShapeResult.boundingBox) return;

    centerCanvasToBox(canvas, tileShapeResult.boundingBox, canvasDims.width, canvasDims.height);
  }, [canvasRef, tileShapeResult.boundingBox, canvasDims]);

  return <canvas ref={canvasHtmlRef} />;
}
