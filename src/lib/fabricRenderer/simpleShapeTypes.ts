/**
 * Supported simple shape types
 */
export type SimpleShapeType =
  | 'circle'
  | 'square'
  | 'triangle'
  | 'diamond'
  | 'star'
  | 'hexagon'
  | 'rounded'
  | 'rectangle'
  | 'rect'
  | 'ellipse';

/**
 * List of all supported simple shapes for validation
 */
export const SIMPLE_SHAPES: readonly SimpleShapeType[] = [
  'circle',
  'square',
  'triangle',
  'diamond',
  'star',
  'hexagon',
  'rounded',
  'rectangle',
  'rect',
  'ellipse',
] as const;

/**
 * Type guard to check if a string is a valid simple shape
 */
export function isValidSimpleShape(shape: string): shape is SimpleShapeType {
  return SIMPLE_SHAPES.includes(shape as SimpleShapeType);
}
