import { ComponentTemplateSpecs } from './components';

export interface ComponentPosition {
  x: number;
  y: number;
}

export interface WorkerTemplate {
  enabled?: boolean;
  maxCount: number;
  rows: number;
  spacing: number;
  workerSlotPositions: ComponentPosition;
}

export interface NameTemplate {
  enabled?: boolean;
  position: ComponentPosition;
  maxWidth: number;
}

export interface Resource {
  color: string;
  amount: number;
  shape: 'circle' | 'rect';
}

export interface ResourceListTemplate {
  enabled?: boolean;
  resources: Resource[];
  spacing: number;
  position: ComponentPosition;
}

export interface GridPosition {
  x: number;
  y: number;
}

// Base interface for all tile shapes
export interface BaseTileShape {
  type: string;
}

// Square tile shape with specific settings
export interface SquareTileShape extends BaseTileShape {
  type: 'square';
  vertices: GridPosition[];
  gridSize?: number; // Optional grid size for snapping
}

// Hexagon tile shape with specific settings
export interface HexagonTileShape extends BaseTileShape {
  type: 'hexagon';
  vertices: GridPosition[];
  radius?: number; // Optional radius for size control
  orientation?: 'pointy' | 'flat'; // Orientation of the hexagon
}

// Union type for all supported tile shapes
export type TileShape = SquareTileShape | HexagonTileShape;

export interface TemplateDefinition {
  id?: number;
  shape: TileShape;
  name: string;
  components: {
    [componentInstanceId: string]: {
      componentId: number;
      templateSpecs: ComponentTemplateSpecs;
    };
  };
}
