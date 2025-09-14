import { ComponentTemplateSpecs } from './components';

export interface ComponentPosition {
  x: number;
  y: number;
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
}

// Hexagon tile shape with specific settings
export interface HexagonTileShape extends BaseTileShape {
  type: 'hexagon';
  vertices: GridPosition[];
}

// Union type for all supported tile shapes
export type TileShape = SquareTileShape | HexagonTileShape;

export interface ComponentRenderDefinition {
  componentId: number;
  templateSpecs: ComponentTemplateSpecs;
}

export interface TemplateDefinition {
  id?: number;
  shape: TileShape;
  name: string;
  components: {
    [componentInstanceId: string]: ComponentRenderDefinition;
  };
}
