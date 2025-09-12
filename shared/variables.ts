export interface VariableColor {
  id?: number;
  name: string;
  value: string; // hex color value
  description?: string;
}

export interface VariableShape {
  id?: number;
  name: string;
  type: 'image' | 'svg' | 'simple-shape';
  value: string; // URL for image, SVG code for svg, shape name for simple shapes
  description?: string;
}

export interface VariableDimension {
  id?: number;
  name: string;
  value: number; // value in pixels or mm depending on unit
  unit: 'px' | 'mm' | 'cm' | 'in';
  description?: string;
}

export interface VariableName {
  id?: number;
  name: string;
  value: string;
  description?: string;
}

export interface Variables {
  colors: VariableColor[];
  shapes: VariableShape[];
  dimensions: VariableDimension[];
  names: VariableName[];
}

// Type for individual variable operations
export type VariableType = 'colors' | 'shapes' | 'dimensions' | 'names';
export type Variable = VariableColor | VariableShape | VariableDimension | VariableName;
