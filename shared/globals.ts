export interface GlobalColor {
  id?: number;
  name: string;
  value: string; // hex color value
  description?: string;
}

export interface GlobalShape {
  id?: number;
  name: string;
  type: 'image' | 'svg' | 'simple-shape';
  value: string; // URL for image, SVG code for svg, shape name for simple shapes
  description?: string;
}

export interface GlobalDimension {
  id?: number;
  name: string;
  value: number; // value in pixels or mm depending on unit
  unit: 'px' | 'mm' | 'cm' | 'in';
  description?: string;
}

export interface GlobalName {
  id?: number;
  name: string;
  value: string;
  description?: string;
}

export interface GlobalVariables {
  colors: GlobalColor[];
  shapes: GlobalShape[];
  dimensions: GlobalDimension[];
  names: GlobalName[];
}

// Type for individual variable operations
export type GlobalVariableType = 'colors' | 'shapes' | 'dimensions' | 'names';
export type GlobalVariable = GlobalColor | GlobalShape | GlobalDimension | GlobalName;
