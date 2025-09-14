export interface CanvasPosition {
  x: number;
  y: number;
  rotation: number; // in degrees
  scale: number; // 1 = 100%
}

export interface ChoiceOption {
  id: number;
  name: string;

  fillColorId?: number;
  strokeColorId?: number;

  innerComponent?: {
    id: number; // ID of another component to place inside this one
    position: CanvasPosition;
  };
}

export interface ComponentStaticSpecs {
  id?: number; // Optional for new components, assigned by database
  name: string;
  description?: string;
  shapeId: number;
  width: number; // Component width in pixels
  height: number; // Component height in pixels

  choices: ChoiceOption[];
}

export interface ComponentTemplateSpecs {
  position: CanvasPosition;
  maxCount: number;
  rows: number;
  spacing: number;
}

export interface ComponentDefinition {
  id?: number; // Optional for new components, assigned by database

  // Specs that are not modified by a template or final tile
  staticSpecs: ComponentStaticSpecs;

  // Specs that are set by a template
  templateSpecs?: ComponentTemplateSpecs;

  // IDs of tiles that are placed on this component
  tileChoices: number[];
}
