import  fabric  from 'fabric';

export type TileShape = '1x1' | '2x2' | 'L' | 'T';
export type WorkerType = 'any' | 'military' | 'economic' | 'religion';
export type EdgeType = 'road' | 'river' | 'wall' | 'none';

export interface TileCost {
  [resource: string]: number;
}

export interface WorkerSlot {
  id: string;
  position: fabric.Point;
  type: WorkerType;
}

export interface Edge {
  color: string;
  type: EdgeType;
}

export interface Tile {
  id: string;
  name: string;
  shape: TileShape;
  factionColor: string;
  artUrl?: string;
  cost: TileCost;
  workerSlots: WorkerSlot[];
  edges: Edge[];
}

export interface TileSet {
  id: string;
  name: string;
  description: string;
  tiles: Tile[];
}
