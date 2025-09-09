import { Resource, ResourceListTemplate } from '@shared/templates';
import * as fabric from 'fabric';
import { CanvasComponentConfig, ComponentFactory } from '@/hooks/useCanvasComponents';

interface ResourceListConfig extends CanvasComponentConfig {
  resources: Resource[];
  spacing: number;
}

const createResourceIcon = (color: string, amount: number, shapeType: 'circle' | 'rect') => {
  let shape;
  const shapeSize = 20;

  if (shapeType === 'circle') {
    shape = new fabric.Circle({
      radius: shapeSize / 2,
      fill: color,
      originX: 'center',
      originY: 'center',
    });
  } else {
    // rect
    shape = new fabric.Rect({
      width: shapeSize,
      height: shapeSize,
      fill: color,
      originX: 'center',
      originY: 'center',
    });
  }

  const text = new fabric.Textbox(amount.toString(), {
    fontSize: 14,
    fill: 'white',
    originX: 'center',
    originY: 'center',
    fontWeight: 'bold',
    fontFamily: 'Lato',
  });

  return new fabric.Group([shape, text]);
};

const createResourceList = (config: ResourceListConfig) => {
  const { spacing, position } = config;

  // Use provided resources or sensible defaults
  const resourcesToRender =
    config.resources && config.resources.length > 0
      ? config.resources
      : [
          { color: '#ff6b6b', amount: 2, shape: 'circle' as const },
          { color: '#4ecdc4', amount: 1, shape: 'rect' as const },
          { color: '#45b7d1', amount: 3, shape: 'circle' as const },
        ];

  const icons = resourcesToRender.map((res) => {
    return createResourceIcon(res.color, res.amount, res.shape);
  });

  // Position icons horizontally
  let currentWidth = 0;
  for (const icon of icons) {
    icon.left = currentWidth;
    currentWidth += (icon.width || 0) + spacing;
  }

  const group = new fabric.Group(icons, {
    left: position.x || 0,
    top: position.y || 0,
    cornerColor: 'green',
    cornerSize: 6,
    transparentCorners: false,
    subTargetCheck: true,
    lockScalingX: true,
    lockScalingY: true,
  });

  return group;
};

export const resourceListFactory: ComponentFactory<ResourceListConfig> = {
  create: (config, _canvasWidth, _canvasHeight) => {
    if (!config.enabled) return null;
    return createResourceList(config);
  },

  shouldUpdate: (oldConfig, newConfig) => {
    return (
      JSON.stringify(oldConfig.resources) !== JSON.stringify(newConfig.resources) ||
      oldConfig.spacing !== newConfig.spacing ||
      oldConfig.position.x !== newConfig.position.x ||
      oldConfig.position.y !== newConfig.position.y ||
      oldConfig.enabled !== newConfig.enabled
    );
  },
};

// Helper function to convert ResourceListTemplate to ResourceListConfig
export const resourceListTemplateToConfig = (
  template: ResourceListTemplate,
  componentId: string = 'resourceList'
): ResourceListConfig => {
  return {
    id: componentId,
    enabled: template.enabled !== false, // Default to true unless explicitly false
    position: template.position || { x: 100, y: 100 },
    resources: template.resources || [], // Will use factory defaults if empty
    spacing: template.spacing !== undefined ? template.spacing : 12,
  };
};
