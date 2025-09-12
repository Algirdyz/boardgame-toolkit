import * as fabric from 'fabric';
import { renderComponent } from './componentRenderer';
import { ComponentRenderOptions, RenderContext } from './types';

/**
 * Utility function to add a rendered component to the canvas
 */
export async function addComponentToCanvas(
  componentId: number,
  context: RenderContext,
  options: ComponentRenderOptions = {}
): Promise<fabric.FabricObject | null> {
  const fabricObject = await renderComponent(componentId, context, options);
  if (fabricObject) {
    context.canvas.add(fabricObject);
    context.canvas.renderAll();
  }
  return fabricObject;
}

/**
 * Utility function to clear all components from canvas
 */
export function clearCanvas(canvas: fabric.Canvas): void {
  canvas.clear();
}

/**
 * Utility function to remove specific component from canvas
 */
export function removeComponentFromCanvas(
  canvas: fabric.Canvas,
  componentId: number,
  choiceIndex?: number
): void {
  const objects = canvas.getObjects();
  const toRemove = objects.filter((obj: fabric.FabricObject) => {
    const objComponentId = obj.get('componentId');
    const objChoiceIndex = obj.get('choiceIndex');

    if (objComponentId !== componentId) return false;
    if (choiceIndex !== undefined && objChoiceIndex !== choiceIndex) return false;

    return true;
  });

  toRemove.forEach((obj: fabric.FabricObject) => canvas.remove(obj));
  canvas.renderAll();
}
