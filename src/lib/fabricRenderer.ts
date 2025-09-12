import { CanvasPosition, ComponentStaticSpecs } from '@shared/components';
import { GlobalColor, GlobalShape, GlobalVariables } from '@shared/globals';
import * as fabric from 'fabric';

export interface RenderContext {
  canvas: fabric.Canvas;
  globalVariables: GlobalVariables;
  components: ComponentStaticSpecs[];
  scale?: number; // Default scale for rendering
}

export interface ComponentRenderOptions {
  position?: CanvasPosition;
  choiceIndex?: number; // Which choice option to render (default: 0)
  allowInteraction?: boolean; // Whether the rendered object should be interactive
}

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

/**
 * Creates a Fabric.js object from a shape definition
 */
async function createFabricShape(
  shape: GlobalShape,
  fillColor?: GlobalColor,
  strokeColor?: GlobalColor
): Promise<fabric.FabricObject | null> {
  const fill = fillColor?.value || 'transparent';
  const stroke = strokeColor?.value || '#000000';
  const strokeWidth = strokeColor ? 2 : 0;

  switch (shape.type) {
    case 'simple-shape':
      return createSimpleShape(shape.value, fill, stroke, strokeWidth);

    case 'svg':
      return createSvgShape(shape.value, fill, stroke, strokeWidth);

    case 'image':
      return createImageShape(shape.value);

    default:
      console.warn(`Unknown shape type: ${shape.type}`);
      return null;
  }
}

/**
 * Creates simple geometric shapes
 */
function createSimpleShape(
  shapeName: string,
  fill: string,
  stroke: string,
  strokeWidth: number
): fabric.FabricObject | null {
  const commonProps = {
    fill,
    stroke,
    strokeWidth,
    originX: 'center' as const,
    originY: 'center' as const,
    selectable: false,
    evented: false,
  };

  switch (shapeName.toLowerCase()) {
    case 'circle':
      return new fabric.Circle({
        ...commonProps,
        radius: 50,
      });

    case 'rectangle':
    case 'rect':
      return new fabric.Rect({
        ...commonProps,
        width: 100,
        height: 60,
      });

    case 'square':
      return new fabric.Rect({
        ...commonProps,
        width: 80,
        height: 80,
      });

    case 'triangle':
      return new fabric.Triangle({
        ...commonProps,
        width: 80,
        height: 80,
      });

    case 'ellipse':
      return new fabric.Ellipse({
        ...commonProps,
        rx: 60,
        ry: 40,
      });

    default:
      console.warn(`Unknown simple shape: ${shapeName}`);
      return new fabric.Rect({
        ...commonProps,
        width: 80,
        height: 80,
      });
  }
}

/**
 * Creates an SVG shape from SVG code
 */
async function createSvgShape(
  svgCode: string,
  fill: string,
  stroke: string,
  strokeWidth: number
): Promise<fabric.FabricObject | null> {
  try {
    const result = await fabric.loadSVGFromString(svgCode);
    const { objects, options } = result;

    if (objects && objects.length > 0) {
      const validObjects = objects.filter((obj): obj is fabric.FabricObject => obj !== null);
      const svgObject = fabric.util.groupSVGElements(validObjects, options);

      svgObject.set({
        fill,
        stroke,
        strokeWidth,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      });

      return svgObject;
    }

    console.warn('Failed to load SVG: no objects found');
    return null;
  } catch (error) {
    console.warn('Failed to load SVG:', error);
    return null;
  }
}

/**
 * Creates an image shape from URL
 */
async function createImageShape(imageUrl: string): Promise<fabric.FabricObject | null> {
  try {
    const img = await fabric.FabricImage.fromURL(imageUrl, {
      crossOrigin: 'anonymous',
    });

    if (img) {
      img.set({
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        // Scale image to reasonable size
        scaleX: 100 / (img.width || 100),
        scaleY: 100 / (img.height || 100),
      });
      return img;
    }

    console.warn('Failed to load image:', imageUrl);
    return null;
  } catch (error) {
    console.warn('Failed to load image:', imageUrl, error);
    return null;
  }
}

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
