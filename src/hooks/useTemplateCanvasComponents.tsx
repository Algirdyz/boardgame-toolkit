import { useCallback, useEffect, useMemo, useRef } from 'react';
import { TemplateDefinition } from '@shared/templates';
import { useQuery } from '@tanstack/react-query';
import * as fabric from 'fabric';
import { getComponents } from '@/api/componentApi';
import { getVariables } from '@/api/variablesApi';
import { generateComponentInstances } from '@/lib/componentInstanceUtils';
import { addComponentToCanvas, ComponentRenderOptions, RenderContext } from '@/lib/fabricRenderer';

interface UseTemplateCanvasComponentsOptions {
  canvas: fabric.Canvas | null;
  template: TemplateDefinition;
  onTemplateChange: (template: TemplateDefinition) => void;
  shapeLocked: boolean;
}

export function useTemplateCanvasComponents({
  canvas,
  template,
  onTemplateChange,
  shapeLocked,
}: UseTemplateCanvasComponentsOptions) {
  const componentObjectsRef = useRef<Map<string, fabric.FabricObject>>(new Map());

  // Load variables and components
  const { data: variables } = useQuery({
    queryKey: ['variables'],
    queryFn: getVariables,
  });

  const { data: components } = useQuery({
    queryKey: ['components'],
    queryFn: getComponents,
  });

  // Create render context
  const renderContext: RenderContext | null = useMemo(() => {
    if (!canvas || !variables || !components) return null;

    return {
      canvas,
      variables,
      components,
      scale: 1,
    };
  }, [canvas, variables, components]);

  // Clear component objects when canvas or template changes
  const clearComponentObjects = useCallback(() => {
    componentObjectsRef.current.forEach((obj) => {
      if (canvas && canvas.contains(obj)) {
        canvas.remove(obj);
      }
    });
    componentObjectsRef.current.clear();
  }, [canvas]);

  // Bring all components to front (above shape outline)
  const bringComponentsToFront = useCallback(() => {
    if (!canvas) return;
    componentObjectsRef.current.forEach((obj) => {
      canvas.bringObjectToFront(obj);
    });
    canvas.renderAll();
  }, [canvas]);

  // Re-render all components when needed
  useEffect(() => {
    if (!renderContext || !canvas) return;

    // Clear existing components
    clearComponentObjects();

    // Add canvas event listener to maintain z-order when objects are added
    const handleObjectAdded = (e: { target: fabric.FabricObject }) => {
      const obj = e.target;
      // If a shape object was added, bring components to front
      if (obj && !obj.get('isTemplateComponent')) {
        setTimeout(() => bringComponentsToFront(), 10);
      }
    };

    canvas.on('object:added', handleObjectAdded);

    // Render each component instance
    Object.entries(template.components).forEach(async ([instanceId, componentInstance]) => {
      // Find the component definition to get its dimensions
      const componentDefinition = components?.find((c) => c.id === componentInstance.componentId);
      if (!componentDefinition) {
        console.error(`Component with ID ${componentInstance.componentId} not found`);
        return;
      }
      const componentSize = {
        width: componentDefinition.width,
        height: componentDefinition.height,
      };

      // Generate multiple instances based on template specs
      const instances = generateComponentInstances(
        instanceId,
        componentInstance.templateSpecs,
        componentSize
      );

      // Render each instance
      instances.forEach(async (instance, index) => {
        const options: ComponentRenderOptions = {
          position: instance.position,
          choiceIndex: instance.choiceIndex, // Use the instance-specific choice
          allowInteraction: shapeLocked, // Components are interactive when shape is locked
        };

        try {
          const fabricObject = await addComponentToCanvas(
            componentInstance.componentId,
            renderContext,
            options
          );

          if (fabricObject) {
            // Store reference to the fabric object with unique key
            const uniqueInstanceId = `${instanceId}_${index}`;
            componentObjectsRef.current.set(uniqueInstanceId, fabricObject);

            // Add metadata for identification
            fabricObject.set('templateInstanceId', instanceId);
            fabricObject.set('instanceIndex', index);
            fabricObject.set('isTemplateComponent', true);

            // Set interactivity - components are selectable when shape is locked
            fabricObject.set({
              selectable: shapeLocked,
              evented: shapeLocked,
            });

            // Ensure component is always in front of the shape outline
            canvas.bringObjectToFront(fabricObject);

            // Handle position updates when object is modified
            fabricObject.on('modified', () => {
              if (!shapeLocked) return; // Only update positions when shape is locked (component mode)

              const newPosition = {
                x: fabricObject.left || 0,
                y: fabricObject.top || 0,
                rotation: fabricObject.angle || 0,
                scale: fabricObject.scaleX || 1,
              };

              // For multi-instance components, we update the base position (first instance)
              // and recalculate other instances based on spacing
              if (index === 0) {
                // Only update if position actually changed significantly
                const currentPos = componentInstance.templateSpecs.position;
                if (
                  Math.abs(newPosition.x - currentPos.x) > 0.1 ||
                  Math.abs(newPosition.y - currentPos.y) > 0.1 ||
                  Math.abs(newPosition.rotation - currentPos.rotation) > 0.1 ||
                  Math.abs(newPosition.scale - currentPos.scale) > 0.01
                ) {
                  onTemplateChange({
                    ...template,
                    components: {
                      ...template.components,
                      [instanceId]: {
                        ...componentInstance,
                        templateSpecs: {
                          ...componentInstance.templateSpecs,
                          position: newPosition,
                        },
                      },
                    },
                  });
                }
              }
            });

            // Ensure component stays in front when being moved
            fabricObject.on('moving', () => {
              canvas.bringObjectToFront(fabricObject);
            });
          }
        } catch (error) {
          console.error(`Failed to render component instance ${instanceId}_${index}:`, error);
        }
      });
    });

    // Bring all components to front after rendering
    bringComponentsToFront();
    canvas.renderAll();

    // Cleanup function
    return () => {
      canvas.off('object:added', handleObjectAdded);
    };
  }, [renderContext, JSON.stringify(template.components), shapeLocked, bringComponentsToFront]); // Use JSON.stringify to detect component changes

  // Update interactivity when shape lock changes
  useEffect(() => {
    componentObjectsRef.current.forEach((obj) => {
      obj.set({
        selectable: shapeLocked,
        evented: shapeLocked,
      });
      // Ensure components stay in front when interactivity changes
      if (canvas) {
        canvas.bringObjectToFront(obj);
      }
    });
    canvas?.renderAll();
  }, [shapeLocked, canvas]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearComponentObjects();
    };
  }, [clearComponentObjects]);

  return {
    componentObjects: componentObjectsRef.current,
    bringComponentsToFront,
  };
}
