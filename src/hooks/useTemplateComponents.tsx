import { useCallback, useEffect } from 'react';
import { TemplateDefinition } from '@shared/templates';
import * as fabric from 'fabric';
import { nameFactory, nameTemplateToConfig } from '@/components/tileComponents/nameTag/nameFactory';
import {
  resourceListFactory,
  resourceListTemplateToConfig,
} from '@/components/tileComponents/resourceCost/resourceListFactory';
import {
  workerSlotsFactory,
  workerTemplateToConfig,
} from '@/components/tileComponents/workerSlots/workerSlotsFactory';
import { useCanvasComponents } from '@/hooks/useCanvasComponents';

interface UseTemplateComponentsOptions {
  canvas: fabric.Canvas | null;
  canvasWidth: number;
  canvasHeight: number;
  template: TemplateDefinition;
  onTemplateChange: (template: TemplateDefinition) => void;
}

export function useTemplateComponents({
  canvas,
  canvasWidth,
  canvasHeight,
  template,
  onTemplateChange,
}: UseTemplateComponentsOptions) {
  const { registerComponent, updateComponents, getCurrentPositions, getComponent, enforceZOrder } =
    useCanvasComponents({
      canvas,
      canvasWidth,
      canvasHeight,
    });

  // Register all component factories
  useEffect(() => {
    registerComponent('workerSlots', workerSlotsFactory);
    registerComponent('name', nameFactory);
    registerComponent('resourceList', resourceListFactory);
  }, [registerComponent]);

  // Convert template to component configs
  const getComponentConfigs = useCallback(() => {
    return {
      workerSlots: workerTemplateToConfig(template.workerDefinition),
      name: nameTemplateToConfig(template.nameDefinition),
      resourceList: resourceListTemplateToConfig(template.resourceListDefinition),
    };
  }, [template]);

  // Update components when template changes
  useEffect(() => {
    const configs = getComponentConfigs();
    updateComponents(configs);
  }, [updateComponents, getComponentConfigs]);

  // Set up position tracking for components
  useEffect(() => {
    if (!canvas) return;

    let timeoutId: NodeJS.Timeout;

    const handleObjectMoving = () => {
      // Debounce position updates
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const positions = getCurrentPositions();

        // Update template with new positions
        const updatedTemplate = { ...template };

        if (positions.workerSlots) {
          updatedTemplate.workerDefinition = {
            ...updatedTemplate.workerDefinition,
            workerSlotPositions: positions.workerSlots,
          };
        }

        if (positions.name) {
          updatedTemplate.nameDefinition = {
            ...updatedTemplate.nameDefinition,
            position: positions.name,
          };
        }

        if (positions.resourceList) {
          updatedTemplate.resourceListDefinition = {
            ...updatedTemplate.resourceListDefinition,
            position: positions.resourceList,
          };
        }

        onTemplateChange(updatedTemplate);
      }, 100);
    };

    canvas.on('path:created', handleObjectMoving);
    canvas.on('object:modified', handleObjectMoving);

    return () => {
      clearTimeout(timeoutId);
      canvas.off('path:created', handleObjectMoving);
      canvas.off('object:modified', handleObjectMoving);
    };
  }, [canvas, template, onTemplateChange, getCurrentPositions]);

  return {
    getComponent,
    getCurrentPositions,
    enforceZOrder,
  };
}
