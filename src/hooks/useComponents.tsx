import { useEffect, useMemo, useRef, useState } from 'react';
import { CanvasPosition, ComponentStaticSpecs } from '@shared/components';
import { ComponentRenderDefinition } from '@shared/templates';
import { Variables } from '@shared/variables';
import * as fabric from 'fabric';
import { BoundingBox } from '@/components/canvas/canvasTypes';
import { generateComponentInstances } from '@/lib/componentInstanceUtils';
import { renderComponent, RenderContext } from '@/lib/fabricRenderer';
import { calculateBoundingBox } from '@/lib/fabricRenderer/canvasUtils';

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
  onComponentPositionChange?: (instanceId: string, position: CanvasPosition) => void;
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
  componentChoices,
  allowInteraction = false,
  scale,
  onComponentPositionChange,
}: UseComponentsOptions) {
  const componentGroupsRef = useRef<Map<string, fabric.Group>>(new Map());
  const [boundingBox, setBoundingBox] = useState<BoundingBox | null>(null);

  const choices = useMemo(() => componentChoices || {}, [componentChoices]);

  const renderAllComponents = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    componentGroupsRef.current.forEach((group) => {
      canvas.remove(group);
    });
    componentGroupsRef.current.clear();

    // Create render context
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
      const choiceIndex = choices[instanceId] || 0;

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
          const fabricObject = renderComponent(templateComponent.componentId, renderContext, {
            position: genInstance.position,
            choiceIndex,
            allowInteraction: false, // Individual objects in group should not be interactive
          });

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

    // Update bounding box after all components are rendered
    const groups = Array.from(componentGroupsRef.current.values());
    const newBoundingBox = calculateBoundingBox(groups);
    setBoundingBox(newBoundingBox);
  };

  // Re-render when core data changes
  useEffect(() => {
    renderAllComponents();
  }, [canvasRef.current, components, choices, allComponents, variables, scale]);

  // Update interaction settings when allowInteraction changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    componentGroupsRef.current.forEach((group) => {
      group.set({
        selectable: allowInteraction,
        evented: allowInteraction,
      });
    });
    canvas.renderAll();
  }, [canvasRef.current, allowInteraction]);

  // Cleanup function to remove all component groups
  const cleanup = () => {
    const canvas = canvasRef.current;
    componentGroupsRef.current.forEach((group) => {
      canvas?.remove(group);
    });
    componentGroupsRef.current.clear();
    canvas?.renderAll();
  };

  return {
    cleanup,
    componentGroups: componentGroupsRef.current,
    boundingBox,
  };
}
