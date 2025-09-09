import { WorkerTemplate } from '@shared/templates';
import * as fabric from 'fabric';
import { CanvasComponentConfig, ComponentFactory } from '@/hooks/useCanvasComponents';
import { WORKER_SLOT_SIZE } from '@/lib/constants';

interface WorkerSlotsConfig extends CanvasComponentConfig {
  maxCount: number;
  rows: number;
  spacing: number;
}

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

const createWorkerSlots = (
  config: WorkerSlotsConfig,
  canvasWidth: number,
  canvasHeight: number
) => {
  // Use provided values or sensible defaults
  const maxCount = config.maxCount || 4;
  const rows = config.rows || 2;
  const spacing = config.spacing !== undefined ? config.spacing : 8;
  const position = {
    x: config.position.x !== undefined ? config.position.x : Math.max(50, canvasWidth - 200),
    y: config.position.y !== undefined ? config.position.y : Math.max(50, canvasHeight - 120),
  };

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
    left: position.x,
    top: position.y,
    cornerColor: '#ff9800',
    cornerSize: 6,
    transparentCorners: false,
    lockScalingX: true,
    lockScalingY: true,
    hasControls: false,
  });

  return group;
};

export const workerSlotsFactory: ComponentFactory<WorkerSlotsConfig> = {
  create: (config, canvasWidth, canvasHeight) => {
    if (!config.enabled) return null;
    return createWorkerSlots(config, canvasWidth, canvasHeight);
  },

  shouldUpdate: (oldConfig, newConfig) => {
    return (
      oldConfig.maxCount !== newConfig.maxCount ||
      oldConfig.rows !== newConfig.rows ||
      oldConfig.spacing !== newConfig.spacing ||
      oldConfig.enabled !== newConfig.enabled
    );
  },
};

// Helper function to convert WorkerTemplate to WorkerSlotsConfig
export const workerTemplateToConfig = (
  template: WorkerTemplate,
  componentId: string = 'workerSlots'
): WorkerSlotsConfig => {
  return {
    id: componentId,
    enabled: template.enabled !== false, // Default to true unless explicitly false
    position: template.workerSlotPositions || { x: 300, y: 200 },
    maxCount: template.maxCount || 4,
    rows: template.rows || 2,
    spacing: template.spacing !== undefined ? template.spacing : 8,
  };
};
