import { CanvasPosition, ComponentStaticSpecs } from '@shared/components';
import { Variables } from '@shared/variables';
import * as fabric from 'fabric';

export interface RenderContext {
  canvas: fabric.Canvas;
  variables: Variables;
  components: ComponentStaticSpecs[];
  scale?: number; // Default scale for rendering
}

export interface ComponentRenderOptions {
  position?: CanvasPosition;
  choiceIndex?: number; // Which choice option to render (default: 0)
  allowInteraction?: boolean; // Whether the rendered object should be interactive
}
