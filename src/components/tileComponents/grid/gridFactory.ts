import { ComponentPosition } from '@shared/templates';
import * as fabric from 'fabric';
import { CanvasComponentConfig, ComponentFactory } from '@/hooks/useCanvasComponents';
import { TILE_SIZE } from '@/lib/constants';

interface GridConfig extends CanvasComponentConfig {
  gridSize: number;
  spacing: number;
  color: string;
}

const createGrid = (config: GridConfig, canvasWidth: number, canvasHeight: number) => {
  const { gridSize, spacing, color, position } = config;
  const lines: fabric.Line[] = [];

  // Create vertical lines
  for (let x = 0; x <= canvasWidth; x += gridSize + spacing) {
    const line = new fabric.Line([x, 0, x, canvasHeight], {
      stroke: color,
      strokeWidth: 1,
      selectable: false,
      evented: false,
    });
    lines.push(line);
  }

  // Create horizontal lines
  for (let y = 0; y <= canvasHeight; y += gridSize + spacing) {
    const line = new fabric.Line([0, y, canvasWidth, y], {
      stroke: color,
      strokeWidth: 1,
      selectable: false,
      evented: false,
    });
    lines.push(line);
  }

  const group = new fabric.Group(lines, {
    left: position.x || 0,
    top: position.y || 0,
    selectable: false,
    evented: false,
  });

  return group;
};

export const gridFactory: ComponentFactory<GridConfig> = {
  create: (config, canvasWidth, canvasHeight) => {
    if (!config.enabled) return null;
    return createGrid(config, canvasWidth, canvasHeight);
  },

  shouldUpdate: (oldConfig, newConfig) => {
    return (
      oldConfig.gridSize !== newConfig.gridSize ||
      oldConfig.spacing !== newConfig.spacing ||
      oldConfig.color !== newConfig.color ||
      oldConfig.enabled !== newConfig.enabled
    );
  },
};

// Example helper function
export const createGridConfig = (
  enabled: boolean = false,
  gridSize: number = TILE_SIZE,
  spacing: number = 0,
  color: string = '#ddd',
  position: ComponentPosition = { x: 0, y: 0 }
): GridConfig => {
  return {
    id: 'grid',
    enabled,
    position,
    gridSize,
    spacing,
    color,
  };
};
