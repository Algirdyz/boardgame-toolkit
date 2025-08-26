import type { TemplateType } from "./templateTypes";

export type FactionType = 'mayor' | 'artisan' | 'trader' | 'thief';

export interface WorkerSlot {
    type: 'live' | 'work' | 'fun';
}

export type ResourceType = 'wood' | 'stone' | 'gold' | 'food';

export interface ResourceCost {
    type: ResourceType;
    amount: number;
}

export interface Tile {
    template: TemplateType;
    faction: FactionType;
    name: string;
    workers: WorkerSlot[];
    cost: ResourceCost[];
}