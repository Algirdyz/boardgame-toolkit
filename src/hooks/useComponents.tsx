import { useEffect, useRef } from 'react';
import { ComponentStaticSpecs } from '@shared/components';
import { ComponentRenderDefinition } from '@shared/templates';
import { Variables } from '@shared/variables';
import * as fabric from 'fabric';
import { generateComponentInstances } from '@/lib/componentInstanceUtils';
import { renderComponent, RenderContext } from '@/lib/fabricRenderer';

type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;
type OptionalComponentRenderDefinition = Optional<ComponentRenderDefinition, 'templateSpecs'>;
export interface ComponentDict {
  [instanceId: string]: OptionalComponentRenderDefinition;
}

interface UseComponentsOptions {
  canvasRef: React.RefObject<fabric.Canvas | null>;
  // Core data needed for rendering
  allComponents: ComponentStaticSpecs[]; // Available component definitions
  variables: Variables; // Global variables (colors, shapes, etc.)
  // Template configuration
  components: ComponentDict; // Which components to render and where
  componentChoices?: { [instanceId: string]: number }; // Choice index per component instance
  // Rendering behavior
  allowInteraction?: boolean; // Whether components should be interactive
  scale?: number; // Optional scaling factor
}

/**
 * Hook for rendering template components on a canvas
 * Keeps all components up-to-date based on template specs and choices
 * Does not clear the canvas - works alongside other canvas elements
 */
export function useComponents({
  canvasRef,
  allComponents,
  variables,
  components,
  componentChoices = {},
  allowInteraction = false,
  scale,
}: UseComponentsOptions) {
  const componentObjectsRef = useRef<Map<string, fabric.FabricObject>>(new Map());
  const canvas = canvasRef.current;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !allComponents.length) return;

    const renderAllComponents = async () => {
      // Remove existing component objects
      componentObjectsRef.current.forEach((obj) => {
        canvas.remove(obj);
      });
      componentObjectsRef.current.clear();

      // Create render context from the cleaner parameters
      const renderContext: RenderContext = {
        components: allComponents,
        variables,
        scale,
      };

      // Render each component instance
      for (const [instanceId, templateComponent] of Object.entries(components)) {
        const component = allComponents.find((c) => c.id === templateComponent.componentId);
        if (!component) continue;

        // Get the choice index for this instance
        const choiceIndex = componentChoices[instanceId] || 0;

        // Generate all instances for this component (based on maxCount, rows, etc.)
        const componentSize = { width: component.width, height: component.height };
        const generatedInstances = generateComponentInstances(
          instanceId,
          componentSize,
          templateComponent.templateSpecs
        );

        // Render each generated instance
        for (const genInstance of generatedInstances) {
          try {
            const fabricObject = await renderComponent(
              templateComponent.componentId,
              renderContext,
              {
                position: genInstance.position,
                choiceIndex,
                allowInteraction,
              }
            );

            if (fabricObject) {
              // Add metadata to identify this object
              fabricObject.set('componentInstanceId', instanceId);
              fabricObject.set('generatedInstanceId', genInstance.id);
              fabricObject.set('componentId', templateComponent.componentId);
              fabricObject.set('choiceIndex', choiceIndex);

              canvas.add(fabricObject);
              componentObjectsRef.current.set(genInstance.id, fabricObject);
            }
          } catch (error) {
            console.error(`Failed to render component ${templateComponent.componentId}:`, error);
          }
        }
      }

      canvas.renderAll();
    };

    renderAllComponents();
  }, [canvas, allComponents, variables, components, componentChoices, allowInteraction, scale]);

  // Cleanup function to remove all component objects
  const cleanup = () => {
    componentObjectsRef.current.forEach((obj) => {
      canvas?.remove(obj);
    });
    componentObjectsRef.current.clear();
    canvas?.renderAll();
  };

  return {
    cleanup,
    componentObjects: componentObjectsRef.current,
  };
}
