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
  // Update callbacks
  onComponentPositionChange?: (
    instanceId: string,
    position: { x: number; y: number; rotation: number; scale: number }
  ) => void;
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
  onComponentPositionChange,
}: UseComponentsOptions) {
  const componentGroupsRef = useRef<Map<string, fabric.Group>>(new Map());
  const canvas = canvasRef.current;
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !allComponents.length) return;

    const renderAllComponents = async () => {
      // Remove existing component groups
      componentGroupsRef.current.forEach((group) => {
        canvas.remove(group);
      });
      componentGroupsRef.current.clear();

      // Create render context from the cleaner parameters
      const renderContext: RenderContext = {
        components: allComponents,
        variables,
        scale,
      };

      // Render each component instance as a group
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

        // Create fabric objects for each generated instance
        const fabricObjects: fabric.Object[] = [];

        for (const genInstance of generatedInstances) {
          try {
            const fabricObject = await renderComponent(
              templateComponent.componentId,
              renderContext,
              {
                position: genInstance.position,
                choiceIndex,
                allowInteraction: false, // Individual objects in group should not be interactive
              }
            );

            if (fabricObject) {
              fabricObjects.push(fabricObject);
            }
          } catch (error) {
            console.error(`Failed to render component ${templateComponent.componentId}:`, error);
          }
        }

        if (fabricObjects.length === 0) continue;

        // Get position from templateSpecs or use default
        const groupPosition = templateComponent.templateSpecs?.position || {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
        };

        // Create a group for all instances of this component
        const group = new fabric.Group(fabricObjects, {
          left: groupPosition.x,
          top: groupPosition.y,
          scaleX: groupPosition.scale,
          scaleY: groupPosition.scale,
          angle: groupPosition.rotation,
          selectable: allowInteraction,
          evented: allowInteraction,
          lockScalingX: true,
          lockScalingY: true,
          lockRotation: true,
        });

        // Store instance ID as custom property for identification
        (group as any).instanceId = instanceId;

        // Handle group movement - call update callback if provided
        if (allowInteraction && onComponentPositionChange) {
          group.on('modified', () => {
            const newPosition = {
              x: group.left || 0,
              y: group.top || 0,
              scale: group.scaleX || 1,
              rotation: group.angle || 0,
            };

            onComponentPositionChange(instanceId, newPosition);
          });
        }

        // Add group to canvas and store reference
        canvas.add(group);
        componentGroupsRef.current.set(instanceId, group);
      }

      canvas.renderAll();
    };

    renderAllComponents();
  }, [
    canvas,
    allComponents,
    variables,
    components,
    componentChoices,
    allowInteraction,
    scale,
    onComponentPositionChange,
  ]);

  // Cleanup function to remove all component groups
  const cleanup = () => {
    componentGroupsRef.current.forEach((group) => {
      canvas?.remove(group);
    });
    componentGroupsRef.current.clear();
    canvas?.renderAll();
  };

  return {
    cleanup,
    componentGroups: componentGroupsRef.current,
  };
}
