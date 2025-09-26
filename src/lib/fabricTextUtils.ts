import { VariableTextStyle } from '@shared/variables';
import * as fabric from 'fabric';

export interface TextRenderOptions {
  text?: string;
  x?: number;
  y?: number;
  textColor?: string; // Override color if provided
  selectable?: boolean;
  evented?: boolean;
}

/**
 * Creates a Fabric.js Text object based on text style configuration
 */
export function createFabricText(
  textStyle: VariableTextStyle,
  options: TextRenderOptions = {}
): fabric.Text {
  const {
    text = 'Sample Text',
    x = 0,
    y = 0,
    textColor,
    selectable = false,
    evented = false,
  } = options;

  // Use provided color or default to black if no color specified
  const fillColor = textColor || '#000000';

  return new fabric.FabricText(text, {
    left: x,
    top: y,
    fontSize: textStyle.textSize,
    fontFamily: textStyle.fontFamily,
    fill: fillColor,
    fontWeight: 'normal',
    originX: 'center',
    originY: 'center',
    selectable,
    evented,
    objectCaching: false,
  });
}

/**
 * Creates a Fabric.js Text object with color resolved from variables
 */
export function createFabricTextWithColor(
  textStyle: VariableTextStyle,
  colors: Array<{ id?: number; value: string }>,
  options: TextRenderOptions = {}
): fabric.Text {
  // Resolve color from textColorId if available
  let resolvedColor = options.textColor;
  if (!resolvedColor && textStyle.textColorId) {
    const color = colors.find((c) => c.id === textStyle.textColorId);
    resolvedColor = color?.value || '#000000';
  }

  return createFabricText(textStyle, {
    ...options,
    textColor: resolvedColor,
  });
}
