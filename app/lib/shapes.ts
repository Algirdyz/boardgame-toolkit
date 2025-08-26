
import * as fabric from 'fabric';
import { TILE_SIZE } from './constants';
import { TemplateDefinition, TemplateType } from './templateTypes';

export const getDefaultTemplate = (type: TemplateType): TemplateDefinition => {
    return {
        type,
        workerDefinition: {
            maxCount: 4,
            rows: 1,
            spacing: 10,
            workerSlotPositions: { x: 0, y: 0 },
        }
    }

};

export const getShape = (shape: string, color: string): fabric.Object => {
    switch (shape) {
        case '1x1':
            return new fabric.Rect({
                width: TILE_SIZE,
                height: TILE_SIZE,
                fill: color,
            });
        case '2x2':
            return new fabric.Rect({
                width: TILE_SIZE * 2,
                height: TILE_SIZE * 2,
                fill: color,
            });
        case '1x2':
            return new fabric.Rect({
                width: TILE_SIZE,
                height: TILE_SIZE * 2,
                fill: color,
            });
        case 'L':
            return new fabric.Polygon([
                { x: 0, y: 0 },
                { x: TILE_SIZE * 2, y: 0 },
                { x: TILE_SIZE * 2, y: TILE_SIZE },
                { x: TILE_SIZE, y: TILE_SIZE },
                { x: TILE_SIZE, y: TILE_SIZE * 2 },
                { x: 0, y: TILE_SIZE * 2 },
            ], { fill: color });
        case 'T':
            return new fabric.Polygon([
                { x: 0, y: 0 },
                { x: TILE_SIZE * 3, y: 0 },
                { x: TILE_SIZE * 3, y: TILE_SIZE },
                { x: TILE_SIZE * 2, y: TILE_SIZE },
                { x: TILE_SIZE * 2, y: TILE_SIZE * 2 },
                { x: TILE_SIZE, y: TILE_SIZE * 2 },
                { x: TILE_SIZE, y: TILE_SIZE },
                { x: 0, y: TILE_SIZE },
            ], { fill: color });
        default:
            return new fabric.Rect({
                width: TILE_SIZE,
                height: TILE_SIZE,
                fill: color,
            });
    }
};


