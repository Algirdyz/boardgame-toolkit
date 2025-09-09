export interface ComponentPosition {
  x: number;
  y: number;
}

export interface WorkerTemplate {
  maxCount: number;
  rows: number;
  spacing: number;
  workerSlotPositions: ComponentPosition;
}

export interface NameTemplate {
  position: ComponentPosition;
  maxWidth: number;
}

export interface Resource {
  color: string;
  amount: number;
  shape: 'circle' | 'rect';
}

export interface ResourceListTemplate {
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
  workerDefinition: WorkerTemplate;
  nameDefinition: NameTemplate;
  resourceListDefinition: ResourceListTemplate;
}