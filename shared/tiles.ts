import { TemplateDefinition } from './templates';

export interface TileComponentChoice {
  componentInstanceId: string;
  choiceIndex: number;
}

export interface TileDefinition {
  id?: number;
  name: string;
  templateId: number;
  template?: TemplateDefinition; // Optional populated template for convenience
  componentChoices: {
    [componentInstanceId: string]: number; // Maps component instance ID to choice index
  };
}

export function ensureTileDefaults(tile: Partial<TileDefinition>): TileDefinition {
  return {
    name: tile.name || 'Untitled Tile',
    templateId: tile.templateId || 0,
    componentChoices: tile.componentChoices || {},
    ...tile,
  };
}
