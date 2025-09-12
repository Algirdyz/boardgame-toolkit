import { ComponentTemplateSpecs } from './components';

export interface ComponentPosition {
  x: number;
  y: number;
}

export interface WorkerTemplate {
  enabled?: boolean;
  maxCount: number;
  rows: number;
  spacing: number;
  workerSlotPositions: ComponentPosition;
}

export interface NameTemplate {
  enabled?: boolean;
  position: ComponentPosition;
  maxWidth: number;
}

export interface Resource {
  color: string;
  amount: number;
  shape: 'circle' | 'rect';
}

export interface ResourceListTemplate {
  enabled?: boolean;
  resources: Resource[];
  spacing: number;
  position: ComponentPosition;
}

export interface GridPosition {
  x: number;
  y: number;
}

export interface TemplateDefinition {
  id?: number;
  shape: GridPosition[];
  name: string;
  components: {
    [componentInstanceId: string]: {
      componentId: number;
      templateSpecs: ComponentTemplateSpecs;
    };
  };
}
