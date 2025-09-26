import { CanvasPosition } from './components';
import { VariableTextStyle } from './variables';

export interface TextTemplateSpecs {
  position: CanvasPosition;
  width: number;
  height: number;
}

export interface TextDefinition {
  id?: number; // Optional for new components, assigned by database

  // Specs that are not modified by a template or final tile
  style: VariableTextStyle;

  // Specs that are set by a template
  templateSpecs?: TextTemplateSpecs;

  // The text content to display
  textContent: string; // The actual text content to display
}
