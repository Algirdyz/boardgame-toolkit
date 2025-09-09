import { NameTemplate } from '@shared/templates';
import * as fabric from 'fabric';
import { CanvasComponentConfig, ComponentFactory } from '@/hooks/useCanvasComponents';

interface NameConfig extends CanvasComponentConfig {
  maxWidth: number;
  text?: string;
}

const createNameComponent = (config: NameConfig) => {
  // Use provided values or sensible defaults
  const text = config.text || 'Tile Name';
  const left = config.position.x !== undefined ? config.position.x : 200;
  const top = config.position.y !== undefined ? config.position.y : 30;
  const width = config.maxWidth || 180;

  const nameText = new fabric.Textbox(text, {
    left,
    top,
    width,
    fontSize: 20,
    textAlign: 'center',
    backgroundColor: '#e3f2fd',
    rx: 8,
    ry: 8,
    borderColor: '#2196f3',
    cornerColor: '#2196f3',
    cornerSize: 6,
    transparentCorners: false,
    lockScalingY: true,
    snapAngle: 90,
    editable: false,
    fontFamily: 'Lato',
    fill: '#1976d2',
  });

  return nameText;
};

export const nameFactory: ComponentFactory<NameConfig> = {
  create: (config, _canvasWidth, _canvasHeight) => {
    if (!config.enabled) return null;
    return createNameComponent(config);
  },

  update: (object, config, _canvasWidth, _canvasHeight) => {
    const textbox = object as fabric.Textbox;
    textbox.set({
      left: config.position.x,
      top: config.position.y,
      width: config.maxWidth,
    });
  },

  shouldUpdate: (oldConfig, newConfig) => {
    return (
      oldConfig.maxWidth !== newConfig.maxWidth ||
      oldConfig.position.x !== newConfig.position.x ||
      oldConfig.position.y !== newConfig.position.y ||
      oldConfig.enabled !== newConfig.enabled
    );
  },
};

// Helper function to convert NameTemplate to NameConfig
export const nameTemplateToConfig = (
  template: NameTemplate,
  componentId: string = 'name'
): NameConfig => {
  return {
    id: componentId,
    enabled: template.enabled !== false, // Default to true unless explicitly false
    position: template.position || { x: 200, y: 30 },
    maxWidth: template.maxWidth || 180,
  };
};
