export type TemplateType = '1x1' | '1x2' | '2x2' | 'L' | 'T';

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
    font: string;
    position: ComponentPosition;
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

export interface TemplateDefinition {
    type: TemplateType;
    workerDefinition: WorkerTemplate;
    nameDefinition: NameTemplate;
    resourceListDefinition: ResourceListTemplate;
}