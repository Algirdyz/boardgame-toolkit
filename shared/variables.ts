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

export interface VariableTextStyle {
  id?: number;
  name: string;
  textSize: number; // Font size in pixels
  fontFamily: string; // Font family name
  textColorId?: number; // Reference to a color variable
  strokeWidth: number; // Stroke width for text outline
  description?: string;
}

export interface Variables {
  colors: VariableColor[];
  shapes: VariableShape[];
  dimensions: VariableDimension[];
  names: VariableName[];
  textStyles: VariableTextStyle[];
}

// Type for individual variable operations
export type VariableType = 'colors' | 'shapes' | 'dimensions' | 'names' | 'textStyles';
export type Variable =
  | VariableColor
  | VariableShape
  | VariableDimension
  | VariableName
  | VariableTextStyle;
