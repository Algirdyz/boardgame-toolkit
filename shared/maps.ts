export interface MapDefinition {
  id?: number;
  name: string;
  tileShape: 'square' | 'hexagon';
  // Future properties can be added here:
  // - tiles: array of positioned tiles
  // - size: map dimensions
  // - backgroundColor: map background color
  // - etc.
}
