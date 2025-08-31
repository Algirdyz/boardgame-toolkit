import { WORKER_SLOT_SIZE } from '@/components/lib/constants';
import { WorkerTemplate } from '@/components/lib/templateTypes';
import * as fabric from 'fabric';

const createWorkerSlot = () => {
    const slotSize = WORKER_SLOT_SIZE;
    return new fabric.Rect({
        width: slotSize,
        height: slotSize,
        fill: 'transparent',
        stroke: 'orange',
        strokeWidth: 2,
        rx: 5,
        ry: 5,
    });
};

export const createWorkerSlots = (definition: WorkerTemplate, canvasWidth: number, canvasHeight: number) => {
    const { maxCount, rows, spacing } = definition;
    const slots = [];
    const slotSize = WORKER_SLOT_SIZE;
    const slotsPerRow = Math.ceil(maxCount / rows);

    for (let i = 0; i < maxCount; i++) {
        const slot = createWorkerSlot();
        const row = Math.floor(i / slotsPerRow);
        const col = i % slotsPerRow;

        slot.left = col * (slotSize + spacing);
        slot.top = row * (slotSize + spacing);
        slots.push(slot);
    }

    const group = new fabric.Group(slots, {
        left: canvasWidth - 300,
        top: canvasHeight - 150,
        cornerColor: 'orange',
        cornerSize: 6,
        transparentCorners: false,
        lockScalingX: true,
        lockScalingY: true,
        hasControls: false,

    });

    return group;
};

