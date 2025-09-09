import { useCallback, useEffect, useRef } from 'react';
import { ComponentPosition } from '@shared/templates';
import * as fabric from 'fabric';

export interface CanvasComponentConfig {
  id: string;
  enabled: boolean;
  position: ComponentPosition;
  zIndex?: number;
}

export interface ComponentFactory<T extends CanvasComponentConfig> {
  create: (config: T, canvasWidth: number, canvasHeight: number) => fabric.Object | null;
  update?: (object: fabric.Object, config: T, canvasWidth: number, canvasHeight: number) => void;
  shouldUpdate?: (oldConfig: T, newConfig: T) => boolean;
}

type AnyComponentFactory = ComponentFactory<any>;

interface UseCanvasComponentsOptions {
  canvas: fabric.Canvas | null;
  canvasWidth: number;
  canvasHeight: number;
}

interface ComponentInstance<T extends CanvasComponentConfig> {
  config: T;
  object: fabric.Object;
  factory: ComponentFactory<T>;
}

export function useCanvasComponents({
  canvas,
  canvasWidth,
  canvasHeight,
}: UseCanvasComponentsOptions) {
  const componentInstancesRef = useRef<Map<string, ComponentInstance<any>>>(new Map());
  const componentFactoriesRef = useRef<Map<string, AnyComponentFactory>>(new Map());

  // Register a component factory
  const registerComponent = useCallback((componentId: string, factory: AnyComponentFactory) => {
    componentFactoriesRef.current.set(componentId, factory);
  }, []);

  // Ensure proper z-ordering of all objects
  const enforceZOrder = useCallback(() => {
    if (!canvas) return;

    // Send shape-related objects to back
    const allObjects = canvas.getObjects();
    allObjects.forEach((obj) => {
      // Check if object is part of shape (polygon, trigger areas, adjacent areas)
      if (
        obj.type === 'polygon' ||
        (obj.type === 'group' && obj.get('isShapeRelated')) ||
        obj.get('isShapeRelated')
      ) {
        canvas.sendObjectToBack(obj);
      }
    });

    // Bring component objects to front in proper order
    componentInstancesRef.current.forEach((instance) => {
      canvas.bringObjectToFront(instance.object);
    });

    canvas.renderAll();
  }, [canvas]);

  // Update all components
  const updateComponents = useCallback(
    (configs: Record<string, CanvasComponentConfig>) => {
      if (!canvas) return;

      const instances = componentInstancesRef.current;
      const factories = componentFactoriesRef.current;

      // Process each config
      Object.entries(configs).forEach(([componentId, config]) => {
        const factory = factories.get(componentId);
        if (!factory) return;

        const existingInstance = instances.get(componentId);

        if (!config.enabled) {
          // Remove component if it exists but is disabled
          if (existingInstance) {
            canvas.remove(existingInstance.object);
            instances.delete(componentId);
          }
          return;
        }

        if (existingInstance) {
          // Check if update is needed
          const shouldUpdate = factory.shouldUpdate
            ? factory.shouldUpdate(existingInstance.config, config)
            : JSON.stringify(existingInstance.config) !== JSON.stringify(config);

          if (shouldUpdate) {
            // Get current position from fabric object if it has been dragged
            const currentLeft = existingInstance.object.left || 0;
            const currentTop = existingInstance.object.top || 0;

            // Update config with current position if it differs from stored position
            const updatedConfig = {
              ...config,
              position: {
                x: currentLeft,
                y: currentTop,
              },
            };

            if (factory.update) {
              // Use factory update method if available
              factory.update(existingInstance.object, updatedConfig, canvasWidth, canvasHeight);
              existingInstance.config = updatedConfig;
            } else {
              // Recreate the object
              canvas.remove(existingInstance.object);
              const newObject = factory.create(updatedConfig, canvasWidth, canvasHeight);
              if (newObject) {
                setupObjectInteractions(newObject, componentId, updatedConfig);
                canvas.add(newObject);
                instances.set(componentId, {
                  config: updatedConfig,
                  object: newObject,
                  factory,
                });
              }
            }
          }
        } else {
          // Create new component
          const newObject = factory.create(config, canvasWidth, canvasHeight);
          if (newObject) {
            setupObjectInteractions(newObject, componentId, config);
            canvas.add(newObject);
            instances.set(componentId, {
              config,
              object: newObject,
              factory,
            });
          }
        }
      });

      // Remove components that are no longer in configs
      const configKeys = new Set(Object.keys(configs));
      for (const [instanceId, instance] of instances.entries()) {
        if (!configKeys.has(instanceId)) {
          canvas.remove(instance.object);
          instances.delete(instanceId);
        }
      }

      // Enforce proper z-ordering after updating components
      enforceZOrder();
    },
    [canvas, canvasWidth, canvasHeight, enforceZOrder]
  );

  // Setup drag interactions and position tracking
  const setupObjectInteractions = useCallback(
    (object: fabric.Object, _componentId: string, _config: CanvasComponentConfig) => {
      // Configure object for dragging
      object.set({
        moveCursor: 'move',
        hoverCursor: 'move',
        selectable: true,
        evented: true,
        hasControls: false,
        hasBorders: false,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
      });
    },
    []
  );

  // Get current positions of all components (useful for saving state)
  const getCurrentPositions = useCallback((): Record<string, ComponentPosition> => {
    const positions: Record<string, ComponentPosition> = {};

    componentInstancesRef.current.forEach((instance, componentId) => {
      positions[componentId] = {
        x: instance.object.left || 0,
        y: instance.object.top || 0,
      };
    });

    return positions;
  }, []);

  // Get a specific component object (useful for external interactions)
  const getComponent = useCallback((componentId: string): fabric.Object | null => {
    const instance = componentInstancesRef.current.get(componentId);
    return instance?.object || null;
  }, []);

  // Cleanup on canvas change or unmount
  useEffect(() => {
    return () => {
      if (canvas) {
        componentInstancesRef.current.forEach((instance) => {
          canvas.remove(instance.object);
        });
        componentInstancesRef.current.clear();
      }
    };
  }, [canvas]);

  return {
    registerComponent,
    updateComponents,
    getCurrentPositions,
    getComponent,
    enforceZOrder,
  };
}
