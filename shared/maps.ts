export interface MapDefinition {
  id?: number;
  name: string;
  tileShape: 'square' | 'hexagon';
  dimensions: {
    width: number; // number of cells in X direction
    height: number; // number of cells in Y direction
  };
}
