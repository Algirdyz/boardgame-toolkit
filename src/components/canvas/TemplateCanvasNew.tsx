import { TemplateDefinition } from '@shared/templates';
import { useCanvasInteractions } from '@/hooks/useCanvasInteractions';
import useFabricCanvas from '@/hooks/useFabricCanvas';
import useShapeGenerator from '@/hooks/useShapeGenerator';

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

  // For now, just handle the shape. Component rendering will be added later.
  useShapeGenerator(
    canvasRef.current,
    template.shape,
    (newShape) => {
      const updatedTemplate: TemplateDefinition = { ...props.template, shape: newShape };
      onTemplateChange(updatedTemplate);
    },
    editLocked,
    () => {}, // No z-order enforcement needed for shape only
    template.tileShapeType || 'square'
  );

  // TODO: Add component rendering here based on template.components
  // This will be implemented when we add canvas interaction for positioning

  return <canvas ref={canvasHtmlRef} />;
}
