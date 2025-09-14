import { GridPosition } from '@shared/templates';
import * as fabric from 'fabric';
import { renderComponent } from './componentRenderer';
import { ComponentRenderOptions, RenderContext } from './types';
import { BoundingBox } from '@/components/canvas/canvasTypes';
import { fillColor, strokeColor, TILE_SIZE } from '@/lib/constants';
import { generatePolygonVertices } from '@/lib/polygoner';
import { BaseTileShape } from '@/lib/tileSets/baseTileShape';

// ============================================================================
// BOUNDING BOX UTILITIES
// ============================================================================

/**
 * Calculate bounding box from a collection of fabric objects
 */
export function calculateBoundingBox(objects: fabric.FabricObject[]): BoundingBox | null {
  if (objects.length === 0) {
    return null;
  }

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  objects.forEach((obj) => {
    const bounds = obj.getBoundingRect();
    minX = Math.min(minX, bounds.left);
    minY = Math.min(minY, bounds.top);
    maxX = Math.max(maxX, bounds.left + bounds.width);
    maxY = Math.max(maxY, bounds.top + bounds.height);
  });

  if (minX !== Infinity) {
    return {
      left: minX,
      top: minY,
      width: maxX - minX,
      height: maxY - minY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
    };
  }

  return null;
}

/**
 * Calculate combined bounding box from multiple bounding boxes
 */
export function combineBoundingBoxes(boxes: (BoundingBox | null)[]): BoundingBox | null {
  const validBoxes = boxes.filter((box): box is BoundingBox => box !== null);

  if (validBoxes.length === 0) {
    return null;
  }

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  validBoxes.forEach((box) => {
    minX = Math.min(minX, box.left);
    minY = Math.min(minY, box.top);
    maxX = Math.max(maxX, box.left + box.width);
    maxY = Math.max(maxY, box.top + box.height);
  });

  return {
    left: minX,
    top: minY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

/**
 * Center canvas viewport to show the given bounding box
 */
export function centerCanvasToBox(
  canvas: fabric.Canvas,
  boundingBox: BoundingBox,
  canvasWidth: number,
  canvasHeight: number,
  padding: number = 50
): void {
  // Use provided dimensions instead of canvas.getWidth/getHeight
  // to handle cases where canvas isn't fully initialized yet
  if (canvasWidth <= 0 || canvasHeight <= 0) {
    return; // Canvas dimensions not ready
  }

  // Calculate the required zoom to fit the content with padding
  const scaleX = (canvasWidth - padding * 2) / boundingBox.width;
  const scaleY = (canvasHeight - padding * 2) / boundingBox.height;
  const targetZoom = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%

  // Calculate the center point
  const targetCenterX = boundingBox.centerX;
  const targetCenterY = boundingBox.centerY;

  // Set zoom and pan to center the content
  const viewportTransform = canvas.viewportTransform!;
  viewportTransform[4] = canvasWidth / 2 - targetCenterX * targetZoom;
  viewportTransform[5] = canvasHeight / 2 - targetCenterY * targetZoom;
  viewportTransform[0] = targetZoom;
  viewportTransform[3] = targetZoom;

  canvas.setViewportTransform(viewportTransform);
  canvas.renderAll();
}

// ============================================================================
// TILE SHAPE UTILITIES
// ============================================================================

/**
 * Create a clickable square trigger for tile editing
 */
export function createClickableSquare(
  _canvas: fabric.Canvas | null,
  pos: GridPosition,
  addSquare: (position: GridPosition) => void,
  editLocked: boolean = false,
  tileShape: BaseTileShape
): fabric.Group {
  // Get vertices for the tile shape
  const vertices = tileShape.getAllVertices(pos);
  const fabricPoints = vertices.map((v) => new fabric.Point(v.x, v.y));

  // Create the shape outline using the tile shape
  const outline = new fabric.Polygon(fabricPoints, {
    fill: 'rgba(0,0,0,0)',
    stroke: strokeColor,
    strokeWidth: 1,
    strokeDashArray: [TILE_SIZE / 19, TILE_SIZE / 19],
    selectable: false,
    evented: !editLocked,
    hoverCursor: editLocked ? 'default' : 'pointer',
    objectCaching: false,
  });

  // Create plus sign lines (centered in the tile bounds)
  const bounds = outline.getBoundingRect();
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const plusSize = Math.min(bounds.width, bounds.height) * 0.3; // 30% of smaller dimension

  const horizontalLine = new fabric.Line(
    [centerX - plusSize / 2, centerY, centerX + plusSize / 2, centerY],
    {
      stroke: strokeColor,
      strokeWidth: 2,
      selectable: false,
      evented: false,
      objectCaching: false,
    }
  );

  const verticalLine = new fabric.Line(
    [centerX, centerY - plusSize / 2, centerX, centerY + plusSize / 2],
    {
      stroke: strokeColor,
      strokeWidth: 2,
      selectable: false,
      evented: false,
      objectCaching: false,
    }
  );

  // Group the outline and plus sign
  const group = new fabric.Group([outline, horizontalLine, verticalLine], {
    selectable: false,
    evented: !editLocked,
    hoverCursor: editLocked ? 'default' : 'pointer',
    objectCaching: false,
  });

  // Add click handler
  if (!editLocked) {
    group.on('mousedown', () => {
      addSquare(pos);
    });
  }

  return group;
}

/**
 * Create a polygonal shape from grid positions
 */
export function createPolygonalShape(
  points: GridPosition[],
  tileShape: BaseTileShape
): fabric.Polygon {
  // Generate smooth polygon vertices from the discrete grid positions
  const polygonVertices = generatePolygonVertices(points, tileShape);
  const fabricPoints = polygonVertices.map((v) => new fabric.Point(v.x, v.y));

  return new fabric.Polygon(fabricPoints, {
    fill: fillColor,
    stroke: strokeColor,
    strokeWidth: 2,
    selectable: false,
    evented: false,
    objectCaching: false,
  });
}

/**
 * Create an invisible trigger square for tile interaction
 */
export function createInvisibleTriggerSquare(
  pos: GridPosition,
  removeSquare: (position: GridPosition) => void,
  editLocked: boolean = false,
  tileShape: BaseTileShape
): fabric.Group {
  // Get vertices for the tile shape
  const vertices = tileShape.getAllVertices(pos);
  const fabricPoints = vertices.map((v) => new fabric.Point(v.x, v.y));

  // Create an invisible trigger area
  const triggerArea = new fabric.Polygon(fabricPoints, {
    fill: 'rgba(0,0,0,0)',
    stroke: 'rgba(0,0,0,0)',
    selectable: false,
    evented: !editLocked,
    hoverCursor: editLocked ? 'default' : 'pointer',
    objectCaching: false,
  });

  // Create minus sign (centered in the tile bounds)
  const bounds = triggerArea.getBoundingRect();
  const centerX = bounds.left + bounds.width / 2;
  const centerY = bounds.top + bounds.height / 2;
  const minusSize = Math.min(bounds.width, bounds.height) * 0.3; // 30% of smaller dimension

  const minusLine = new fabric.Line(
    [centerX - minusSize / 2, centerY, centerX + minusSize / 2, centerY],
    {
      stroke: fillColor,
      strokeWidth: 3,
      selectable: false,
      evented: false,
      objectCaching: false,
    }
  );

  // Group the trigger and minus sign
  const group = new fabric.Group([triggerArea, minusLine], {
    selectable: false,
    evented: !editLocked,
    hoverCursor: editLocked ? 'default' : 'pointer',
    objectCaching: false,
  });

  // Add click handler
  if (!editLocked) {
    group.on('mousedown', () => {
      removeSquare(pos);
    });
  }

  return group;
}

// ============================================================================
// COMPONENT UTILITIES
// ============================================================================

/**
 * Utility function to add a rendered component to the canvas
 */
export async function addComponentToCanvas(
  canvas: fabric.Canvas,
  componentId: number,
  context: RenderContext,
  options: ComponentRenderOptions = {}
): Promise<fabric.FabricObject | null> {
  const fabricObject = await renderComponent(componentId, context, options);
  if (fabricObject) {
    canvas.add(fabricObject);
    canvas.renderAll();
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

/**
 * Remove all objects from canvas that match a filter function
 */
export function removeObjectsFromCanvas(
  canvas: fabric.Canvas,
  filter: (obj: fabric.FabricObject) => boolean
): void {
  const objects = canvas.getObjects();
  const toRemove = objects.filter(filter);

  toRemove.forEach((obj: fabric.FabricObject) => canvas.remove(obj));
  canvas.renderAll();
}

/**
 * Pan canvas to center a specific object
 */
export function panCanvasToObject(canvas: fabric.Canvas, object: fabric.Object): boolean {
  // Check if canvas is properly initialized
  if (!canvas.width || !canvas.height || canvas.width <= 0 || canvas.height <= 0) {
    return false; // Canvas not ready
  }

  const zoom = canvas.getZoom();
  const vpw = canvas.width / zoom;
  const vph = canvas.height / zoom;
  const center = object.getCenterPoint();
  const x = center.x - vpw / 2;
  const y = center.y - vph / 2;
  canvas.absolutePan(new fabric.Point(x, y));
  canvas.setZoom(zoom);
  return true; // Successfully panned
}
