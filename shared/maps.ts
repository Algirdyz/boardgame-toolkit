export interface CellType {
  id: string; // unique identifier for the cell type
  name: string;
  colorId?: number; // reference to VariableColor
  shapeId?: number; // reference to VariableShape
}

export interface MapDefinition {
  id?: number;
  name: string;
  tileShape: 'square' | 'hexagon';
  dimensions: {
    width: number; // number of cells in X direction
    height: number; // number of cells in Y direction
  };
  cellTypes?: CellType[]; // available cell types for this map
}
