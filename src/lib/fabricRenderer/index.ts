// Export types
export type { RenderContext, ComponentRenderOptions } from './types';
export type { SimpleShapeType } from './simpleShapeTypes';
export { SIMPLE_SHAPES, isValidSimpleShape } from './simpleShapeTypes';

// Export component rendering
export { renderComponent } from './componentRenderer';

// Export shape creation functions
export {
  createFabricShape,
  createSimpleShape,
  createSvgShape,
  createImageShape,
} from './shapeFactory';

// Export canvas utilities
export { addComponentToCanvas, clearCanvas, removeComponentFromCanvas } from './canvasUtils';
