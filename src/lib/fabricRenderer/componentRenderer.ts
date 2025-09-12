import { CanvasPosition } from '@shared/components';
import * as fabric from 'fabric';
import { createFabricShape } from './shapeFactory';
import { ComponentRenderOptions, RenderContext } from './types';

/**
 * Renders a component to a Fabric.js canvas based on its static definition
 */
export async function renderComponent(
  componentId: number,
  context: RenderContext,
  options: ComponentRenderOptions = {}
): Promise<fabric.FabricObject | null> {
  const component = context.components.find((c) => c.id === componentId);
  if (!component) {
    console.warn(`Component with ID ${componentId} not found`);
    return null;
  }

  // Get the choice to render (default to first choice)
  const choiceIndex = options.choiceIndex ?? 0;
  const choice = component.choices[choiceIndex];
  if (!choice) {
    console.warn(`Choice index ${choiceIndex} not found for component ${component.name}`);
    return null;
  }

  // Get the shape definition
  const shape = context.globalVariables.shapes.find((s) => s.id === component.shapeId);
  if (!shape) {
    console.warn(`Shape with ID ${component.shapeId} not found for component ${component.name}`);
    return null;
  }

  // Get colors
  const fillColor = context.globalVariables.colors.find((c) => c.id === choice.fillColorId);
  const strokeColor = context.globalVariables.colors.find((c) => c.id === choice.strokeColorId);

  // Create the base shape
  const fabricObject = await createFabricShape(shape, fillColor, strokeColor);
  if (!fabricObject) {
    return null;
  }

  // Apply positioning
  const position = options.position || { x: 0, y: 0, rotation: 0, scale: 1 };
  const finalScale = (position.scale || 1) * (context.scale || 1);

  fabricObject.set({
    left: position.x,
    top: position.y,
    angle: position.rotation,
    scaleX: finalScale,
    scaleY: finalScale,
    selectable: options.allowInteraction ?? false,
    evented: options.allowInteraction ?? false,
  });

  // Handle nested components
  const nestedObjects: fabric.FabricObject[] = [fabricObject];

  // Handle inner component with custom positioning
  if (choice.innerComponent) {
    const innerPosition: CanvasPosition = {
      x: position.x + choice.innerComponent.position.x * finalScale,
      y: position.y + choice.innerComponent.position.y * finalScale,
      rotation: position.rotation + choice.innerComponent.position.rotation,
      scale: position.scale * choice.innerComponent.position.scale,
    };

    const innerObject = await renderComponent(choice.innerComponent.id, context, {
      position: innerPosition,
      allowInteraction: options.allowInteraction,
    });
    if (innerObject) {
      nestedObjects.push(innerObject);
    }
  }

  // If we have multiple objects, group them
  if (nestedObjects.length > 1) {
    const group = new fabric.Group(nestedObjects, {
      selectable: options.allowInteraction ?? false,
      evented: options.allowInteraction ?? false,
    });

    // Add metadata for identification
    group.set('componentId', componentId);
    group.set('choiceIndex', choiceIndex);

    return group;
  }

  // Add metadata for identification
  fabricObject.set('componentId', componentId);
  fabricObject.set('choiceIndex', choiceIndex);

  return fabricObject;
}
