import { CanvasPosition, ComponentTemplateSpecs } from '@shared/components';

export interface ComponentInstance {
  id: string;
  position: CanvasPosition;
  choiceIndex?: number;
}

/**
 * Generates multiple component instances based on template specifications
 * @param baseInstanceId - The base instance ID for generating unique instance IDs
 * @param templateSpecs - The template specifications (maxCount, rows, spacing, etc.)
 * @param componentSize - Estimated size of each component for gap calculation
 * @returns Array of component instances with calculated positions
 */
export function generateComponentInstances(
  baseInstanceId: string,
  componentSize: { width: number; height: number },
  templateSpecs?: ComponentTemplateSpecs
): ComponentInstance[] {
  const {
    maxCount = 1,
    rows = 1,
    spacing = 0,
    position = {
      rotation: 0,
      scale: 1,
      x: 0,
      y: 0,
    },
  } = templateSpecs || {};
  const instances: ComponentInstance[] = [];

  // Calculate how many components per row
  const componentsPerRow = Math.ceil(maxCount / rows);

  for (let i = 0; i < maxCount; i++) {
    const row = Math.floor(i / componentsPerRow);
    const col = i % componentsPerRow;

    // Calculate position offset based on row and column
    // Spacing now represents gaps between components, not distance from start to start
    const offsetX = col * (componentSize.width * position.scale + spacing);
    const offsetY = row * (componentSize.height * position.scale + spacing);

    const instancePosition: CanvasPosition = {
      x: position.x + offsetX,
      y: position.y + offsetY,
      rotation: position.rotation,
      scale: position.scale,
    };

    instances.push({
      id: `${baseInstanceId}_${i}`,
      position: instancePosition,
      choiceIndex: 0, // Default choice, could be made configurable per instance
    });
  }

  return instances;
}

/**
 * Calculates the bounding rectangle for all component instances
 * @param instances - Array of component instances
 * @param componentSize - Estimated size of each component (width, height)
 * @returns Bounding rectangle { x, y, width, height }
 */
export function calculateInstancesBounds(
  instances: ComponentInstance[],
  componentSize: { width: number; height: number }
): { x: number; y: number; width: number; height: number } {
  if (instances.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  instances.forEach((instance) => {
    const halfWidth = (componentSize.width * instance.position.scale) / 2;
    const halfHeight = (componentSize.height * instance.position.scale) / 2;

    minX = Math.min(minX, instance.position.x - halfWidth);
    minY = Math.min(minY, instance.position.y - halfHeight);
    maxX = Math.max(maxX, instance.position.x + halfWidth);
    maxY = Math.max(maxY, instance.position.y + halfHeight);
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Updates template specs with intelligent defaults and validation
 * @param specs - Partial template specs to update
 * @param currentSpecs - Current template specs
 * @returns Updated and validated template specs
 */
export function updateTemplateSpecs(
  specs: Partial<ComponentTemplateSpecs>,
  currentSpecs: ComponentTemplateSpecs
): ComponentTemplateSpecs {
  const updatedSpecs = { ...currentSpecs, ...specs };

  // Validation and intelligent defaults
  updatedSpecs.maxCount = Math.max(1, updatedSpecs.maxCount);
  updatedSpecs.rows = Math.max(1, Math.min(updatedSpecs.rows, updatedSpecs.maxCount));
  updatedSpecs.spacing = Math.max(0, updatedSpecs.spacing);

  // Ensure position values are valid
  updatedSpecs.position.scale = Math.max(0.1, Math.min(5, updatedSpecs.position.scale));
  updatedSpecs.position.rotation %= 360;

  return updatedSpecs;
}

/**
 * Creates default template specs for a new component
 * @param position - Initial position for the component
 * @returns Default template specs
 */
export function createDefaultTemplateSpecs(position: CanvasPosition): ComponentTemplateSpecs {
  return {
    position,
    maxCount: 1,
    rows: 1,
    spacing: 5, // Default spacing between instances
  };
}

/**
 * Calculates optimal spacing based on component count and available space
 * @param maxCount - Maximum number of components
 * @param rows - Number of rows
 * @param availableSpace - Available space { width, height }
 * @param componentSize - Size of each component
 * @returns Suggested spacing value
 */
export function calculateOptimalSpacing(
  maxCount: number,
  rows: number,
  availableSpace: { width: number; height: number },
  componentSize: { width: number; height: number }
): number {
  const componentsPerRow = Math.ceil(maxCount / rows);

  // Calculate spacing based on available width
  const horizontalSpacing = availableSpace.width / (componentsPerRow + 1);

  // Calculate spacing based on available height
  const verticalSpacing = availableSpace.height / (rows + 1);

  // Use the smaller spacing to ensure components fit
  const suggestedSpacing = Math.min(horizontalSpacing, verticalSpacing);

  // Ensure minimum spacing for readability
  return Math.max(componentSize.width + 10, suggestedSpacing);
}
