import { GlobalColor, GlobalShape } from '@shared/globals';
import * as fabric from 'fabric';
import { isValidSimpleShape, SimpleShapeType } from './simpleShapeTypes';

/**
 * Creates a Fabric.js object from a shape definition
 */
export async function createFabricShape(
  shape: GlobalShape,
  fillColor?: GlobalColor,
  strokeColor?: GlobalColor
): Promise<fabric.FabricObject | null> {
  const fill = fillColor?.value || 'transparent';
  const stroke = strokeColor?.value || '#000000';
  const strokeWidth = strokeColor ? 2 : 0;

  switch (shape.type) {
    case 'simple-shape':
      if (!isValidSimpleShape(shape.value)) {
        console.warn(`Invalid simple shape: ${shape.value}`);
        return null;
      }
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
export function createSimpleShape(
  shapeName: SimpleShapeType,
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

  const normalizedShape = shapeName.toLowerCase();

  // Type-safe switch with exhaustiveness checking
  switch (normalizedShape) {
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

    case 'diamond':
      return new fabric.Rect({
        ...commonProps,
        width: 80,
        height: 80,
        angle: 45,
      });

    case 'star':
      // Fabric.js doesn't have a built-in star, so we'll create a custom polygon
      return createStarShape(commonProps);

    case 'hexagon':
      // Create a hexagon using a polygon
      return createHexagonShape(commonProps);

    case 'rounded':
      return new fabric.Rect({
        ...commonProps,
        width: 80,
        height: 80,
        rx: 20,
        ry: 20,
      });
    default:
      return null;
  }
}

/**
 * Creates a star shape using a polygon
 */
function createStarShape(commonProps: any): fabric.FabricObject {
  // Create a 5-pointed star
  const spikes = 5;
  const outerRadius = 40;
  const innerRadius = 20;
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i * Math.PI) / spikes;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  }

  return new fabric.Polygon(points, {
    ...commonProps,
    left: 0,
    top: 0,
  });
}

/**
 * Creates a hexagon shape using a polygon
 */
function createHexagonShape(commonProps: any): fabric.FabricObject {
  const radius = 40;
  const points: { x: number; y: number }[] = [];

  // Create 6 points for hexagon
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    points.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  }

  return new fabric.Polygon(points, {
    ...commonProps,
    left: 0,
    top: 0,
  });
}

/**
 * Creates an SVG shape from SVG code
 */
export async function createSvgShape(
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
export async function createImageShape(imageUrl: string): Promise<fabric.FabricObject | null> {
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
