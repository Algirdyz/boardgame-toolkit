
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
            workerSlotPositions: { x: 100, y: 200 },
        },
        nameDefinition: {
            font: 'Lato',
            position: { x: 100, y: 50 },
        },
        resourceListDefinition: {
            resources: [
                { color: '#8B4513', amount: 1, shape: 'circle' as const }, // Wood
                { color: 'gray', amount: 2, shape: 'rect' as const },      // Stone
                { color: 'orange', amount: 5, shape: 'circle' as const }     // Gold
            ],
            spacing: 10,
            position: { x: 100, y: 120 },
        }
    }
};

export const getShape = (shapeType: string, color: string): fabric.Object => {
    const strokeWidth = 1;
    const shapeProps = {
        fill: color,
        stroke: 'black',
        strokeWidth,
        strokePosition: 'outside'
    };

    let shape: fabric.Object;

    const createRect = (width: number, height: number) => {
        return new fabric.Rect({
            width,
            height,
        });
    };

    const createPolygon = (points: { x: number; y: number }[]) => {
        return new fabric.Polygon(points);
    };

    switch (shapeType) {
        case '1x1': {
            shape = createRect(TILE_SIZE, TILE_SIZE);
            break;
        }
        case '2x2': {
            shape = createRect(TILE_SIZE * 2, TILE_SIZE * 2);
            break;
        }
        case '1x2': {
            shape = createRect(TILE_SIZE, TILE_SIZE * 2);
            break;
        }
        case 'L': {
            const lPoints = [
                { x: 0, y: 0 },
                { x: TILE_SIZE * 2, y: 0 },
                { x: TILE_SIZE * 2, y: TILE_SIZE },
                { x: TILE_SIZE, y: TILE_SIZE },
                { x: TILE_SIZE, y: TILE_SIZE * 2 },
                { x: 0, y: TILE_SIZE * 2 },
            ];
            shape = createPolygon(lPoints);
            break;
        }
        case 'T': {
            const tPoints = [
                { x: 0, y: 0 },
                { x: TILE_SIZE * 3, y: 0 },
                { x: TILE_SIZE * 3, y: TILE_SIZE },
                { x: TILE_SIZE * 2, y: TILE_SIZE },
                { x: TILE_SIZE * 2, y: TILE_SIZE * 2 },
                { x: TILE_SIZE, y: TILE_SIZE * 2 },
                { x: TILE_SIZE, y: TILE_SIZE },
                { x: 0, y: TILE_SIZE },
            ];
            shape = createPolygon(tPoints);
            break;
        }
        default: {
            shape = createRect(TILE_SIZE, TILE_SIZE);
            break;
        }
    }

    shape.set({ ...shapeProps });

    return shape;
};


