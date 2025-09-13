import { TemplateDefinition } from '@shared/templates';
import { useCanvasInteractions } from '@/hooks/useCanvasInteractions';
import useFabricCanvas from '@/hooks/useFabricCanvas';
import useShapeGenerator from '@/hooks/useShapeGenerator';
import { useTemplateCanvasComponents } from '@/hooks/useTemplateCanvasComponents';

interface TemplateCanvasProps {
  width: number;
  height: number;
  template: TemplateDefinition;
  onTemplateChange: (template: TemplateDefinition) => void;
  editLocked: boolean;
}

export default function TemplateCanvas(props: TemplateCanvasProps) {
  const { template, onTemplateChange, width, height, editLocked } = props;

  const { canvasHtmlRef, canvasRef } = useFabricCanvas(width, height);
  useCanvasInteractions({
    canvasRef,
    panEnabled: true,
    zoomEnabled: true,
  });

  // Handle template components rendering and interaction
  // When editLocked=true: shape editing is disabled, components can be moved
  // When editLocked=false: shape editing is enabled, components are locked
  const { bringComponentsToFront } = useTemplateCanvasComponents({
    canvas: canvasRef.current,
    template,
    onTemplateChange,
    shapeLocked: editLocked, // When editLocked is true, shape editing is locked, so components can be moved
  });

  // Handle shape generation (the tile outline)
  // When editLocked=true: shape editing is disabled
  // When editLocked=false: shape editing is enabled
  useShapeGenerator(
    canvasRef.current,
    template.shape,
    (newShape) => {
      const updatedTemplate: TemplateDefinition = { ...props.template, shape: newShape };
      onTemplateChange(updatedTemplate);
    },
    editLocked, // When true, disables shape editing
    bringComponentsToFront, // Ensure components stay in front after shape updates
    template.tileShapeType || 'square'
  );

  return <canvas ref={canvasHtmlRef} />;
}
