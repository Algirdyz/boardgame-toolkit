import { useEffect, useRef } from 'react';
import { ComponentStaticSpecs, ComponentTemplateSpecs } from '@shared/components';
import { TemplateDefinition } from '@shared/templates';
import { Variables } from '@shared/variables';
import { notifications } from '@mantine/notifications';
import * as fabric from 'fabric';
import { generateComponentInstances } from '@/lib/componentInstanceUtils';
import { renderComponent, RenderContext } from '@/lib/fabricRenderer';

interface UseTemplateCanvasComponentsProps {
  canvas: fabric.Canvas | null;
  template: TemplateDefinition;
  onTemplateChange: (template: TemplateDefinition) => void;
  shapeLocked: boolean;
  availableComponents: ComponentStaticSpecs[];
  variables: Variables;
}

export function useTemplateCanvasComponents({
  canvas,
  template,
  onTemplateChange,
  shapeLocked,
  availableComponents,
  variables,
}: UseTemplateCanvasComponentsProps) {
  const groupsRef = useRef<Map<string, fabric.Group>>(new Map());

  // When shapeLocked is true, components should be selectable/moveable
  // When shapeLocked is false, components should be locked (shape editing mode)
  const componentsSelectable = shapeLocked;

  const bringComponentsToFront = () => {
    if (!canvas) return;

    // Bring all component groups to front
    groupsRef.current.forEach((group) => {
      canvas.bringObjectToFront(group);
    });
    canvas.renderAll();
  };

  const renderComponentGroup = async (
    instanceId: string,
    instance: { componentId: number; templateSpecs: ComponentTemplateSpecs },
    component: ComponentStaticSpecs
  ) => {
    if (!canvas) return;

    // Remove existing group if it exists
    const existingGroup = groupsRef.current.get(instanceId);
    if (existingGroup) {
      canvas.remove(existingGroup);
    }

    // Generate component instances based on template specs
    const componentSize = { width: component.width, height: component.height };
    const instances = generateComponentInstances(instanceId, instance.templateSpecs, componentSize);

    // Create render context for component rendering
    const renderContext: RenderContext = {
      variables,
      components: availableComponents,
      scale: 1,
    };

    // Create fabric objects for each instance
    const fabricObjects: fabric.Object[] = [];

    for (const inst of instances) {
      try {
        // Use the real component renderer
        const fabricObj = await renderComponent(component.id!, renderContext, {
          position: {
            x: inst.position.x,
            y: inst.position.y,
            rotation: inst.position.rotation,
            scale: inst.position.scale,
          },
          allowInteraction: false, // Individual objects in group should not be interactive
        });

        if (fabricObj) {
          fabricObjects.push(fabricObj);
        }
      } catch (error) {
        console.warn(`Failed to render component ${component.id}:`, error);
        notifications.show({
          title: 'Rendering Error',
          message: `Failed to render component ${component.name}. Using placeholder instead.`,
          color: 'red',
        });
      }
    }

    if (fabricObjects.length === 0) return;

    // Create a group for all instances of this component
    const group = new fabric.Group(fabricObjects, {
      left: instance.templateSpecs.position.x,
      top: instance.templateSpecs.position.y,
      scaleX: instance.templateSpecs.position.scale,
      scaleY: instance.templateSpecs.position.scale,
      angle: instance.templateSpecs.position.rotation,
      selectable: componentsSelectable,
      evented: componentsSelectable,
      lockScalingX: true,
      lockScalingY: true,
      lockRotation: true,
    });

    // Store instance ID as custom property for identification
    (group as any).instanceId = instanceId;

    // Handle group movement - update template specs and save to DB
    group.on('modified', () => {
      const newPosition = {
        x: group.left || 0,
        y: group.top || 0,
        scale: group.scaleX || 1,
        rotation: group.angle || 0,
      };

      onTemplateChange({
        ...template,
        components: {
          ...template.components,
          [instanceId]: {
            ...instance,
            templateSpecs: {
              ...instance.templateSpecs,
              position: newPosition,
            },
          },
        },
      });
    });

    // Add group to canvas and store reference
    canvas.add(group);
    groupsRef.current.set(instanceId, group);
  };

  const renderAllComponents = async () => {
    if (!canvas) return;

    // Clear existing groups
    groupsRef.current.forEach((group) => {
      canvas.remove(group);
    });
    groupsRef.current.clear();

    // Render each component instance as a group
    const renderPromises = Object.entries(template.components).map(
      async ([instanceId, instance]) => {
        const component = availableComponents.find((c) => c.id === instance.componentId);
        if (component) {
          await renderComponentGroup(instanceId, instance, component);
        }
      }
    );

    await Promise.all(renderPromises);
    canvas.renderAll();
  };

  // Function to update component specs from GUI controls
  const updateComponentSpecs = async (
    instanceId: string,
    updates: Partial<ComponentTemplateSpecs>
  ) => {
    const instance = template.components[instanceId];
    if (!instance) return;

    // Update template specs
    const updatedInstance = {
      ...instance,
      templateSpecs: {
        ...instance.templateSpecs,
        ...updates,
      },
    };

    onTemplateChange({
      ...template,
      components: {
        ...template.components,
        [instanceId]: updatedInstance,
      },
    });

    // Re-render this specific component group
    const component = availableComponents.find((c) => c.id === instance.componentId);
    if (component) {
      await renderComponentGroup(instanceId, updatedInstance, component);
      canvas?.renderAll();
    }
  };

  // Re-render when template or available components change
  useEffect(() => {
    renderAllComponents();
  }, [canvas, template, availableComponents, variables]);

  // Update existing groups when shapeLocked changes
  useEffect(() => {
    if (!canvas) return;

    groupsRef.current.forEach((group) => {
      group.set({
        selectable: componentsSelectable,
        evented: componentsSelectable,
      });
    });
    canvas.renderAll();
  }, [canvas, componentsSelectable]);

  // Clean up groups when unmounting
  useEffect(() => {
    return () => {
      groupsRef.current.forEach((group) => {
        canvas?.remove(group);
      });
      groupsRef.current.clear();
    };
  }, [canvas]);

  return {
    updateComponentSpecs,
    renderAllComponents,
    bringComponentsToFront,
  };
}
