import {
  VariableColor,
  VariableDimension,
  VariableName,
  VariableShape,
  VariableTextStyle,
  VariableType,
} from '@shared/variables';
import { IconPalette, IconRuler, IconShape, IconTag, IconTypography } from '@tabler/icons-react';
import { ColorVariableCard } from './cardComponents/ColorVariableCard';
import { DimensionVariableCard } from './cardComponents/DimensionVariableCard';
import { NameVariableCard } from './cardComponents/NameVariableCard';
import { ShapeVariableCard } from './cardComponents/ShapeVariableCard';
import { TextStyleVariableCard } from './cardComponents/TextStyleVariableCard';
import { ColorEditForm } from './editForms/ColorEditForm';
import { DimensionEditForm } from './editForms/DimensionEditForm';
import { NameEditForm } from './editForms/NameEditForm';
import { ShapeEditForm } from './editForms/ShapeEditForm';
import { TextStyleEditForm } from './editForms/TextStyleEditForm';
import { VariableTypeConfig, VariableTypeRegistry } from './variableTypeConfig';

// Variable type configurations
const variableTypeConfigs: Record<VariableType, VariableTypeConfig> = {
  colors: {
    id: 'colors',
    name: 'Color',
    pluralName: 'Colors',
    icon: IconPalette,
    editComponent: ColorEditForm,
    listItemComponent: ColorVariableCard,
    description: 'Define reusable color variables with hex values',
    createDefault: (): VariableColor => ({
      name: '',
      value: '#000000',
      description: '',
    }),
    validate: (variable) => {
      const colorVar = variable as VariableColor;
      const errors: Record<string, string> = {};

      if (!colorVar.name?.trim()) {
        errors.name = 'Name is required';
      }

      if (!colorVar.value) {
        errors.value = 'Color value is required';
      } else {
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (!hexRegex.test(colorVar.value)) {
          errors.value = 'Please enter a valid hex color';
        }
      }

      return Object.keys(errors).length > 0 ? errors : null;
    },
  },

  shapes: {
    id: 'shapes',
    name: 'Shape',
    pluralName: 'Shapes',
    icon: IconShape,
    editComponent: ShapeEditForm,
    listItemComponent: ShapeVariableCard,
    description: 'Define reusable shape variables with images, SVGs, or simple shapes',
    createDefault: (): VariableShape => ({
      name: '',
      type: 'simple-shape',
      value: 'rectangle',
      description: '',
    }),
    validate: (variable) => {
      const shapeVar = variable as VariableShape;
      const errors: Record<string, string> = {};

      if (!shapeVar.name?.trim()) {
        errors.name = 'Name is required';
      }

      if (!shapeVar.value?.trim()) {
        errors.value = 'Shape value is required';
      }

      return Object.keys(errors).length > 0 ? errors : null;
    },
  },

  dimensions: {
    id: 'dimensions',
    name: 'Dimension',
    pluralName: 'Dimensions',
    icon: IconRuler,
    editComponent: DimensionEditForm,
    listItemComponent: DimensionVariableCard,
    description: 'Define reusable dimension variables with units',
    createDefault: (): VariableDimension => ({
      name: '',
      value: 100,
      unit: 'px',
      description: '',
    }),
    validate: (variable) => {
      const dimVar = variable as VariableDimension;
      const errors: Record<string, string> = {};

      if (!dimVar.name?.trim()) {
        errors.name = 'Name is required';
      }

      if (dimVar.value === undefined || dimVar.value === null || dimVar.value < 0) {
        errors.value = 'Value must be a positive number';
      }

      return Object.keys(errors).length > 0 ? errors : null;
    },
  },

  names: {
    id: 'names',
    name: 'Name',
    pluralName: 'Names',
    icon: IconTag,
    editComponent: NameEditForm,
    listItemComponent: NameVariableCard,
    description: 'Define reusable name variables for text content',
    createDefault: (): VariableName => ({
      name: '',
      value: '',
      description: '',
    }),
    validate: (variable) => {
      const nameVar = variable as VariableName;
      const errors: Record<string, string> = {};

      if (!nameVar.name?.trim()) {
        errors.name = 'Name is required';
      }

      if (!nameVar.value?.trim()) {
        errors.value = 'Value is required';
      }

      return Object.keys(errors).length > 0 ? errors : null;
    },
  },

  textStyles: {
    id: 'textStyles',
    name: 'Text Style',
    pluralName: 'Text Styles',
    icon: IconTypography,
    editComponent: TextStyleEditForm,
    listItemComponent: TextStyleVariableCard,
    description: 'Define reusable text styling with fonts and colors',
    createDefault: (): VariableTextStyle => ({
      name: '',
      textSize: 16,
      fontFamily: 'Arial, sans-serif',
      strokeWidth: 0,
      description: '',
    }),
    validate: (variable) => {
      const textVar = variable as VariableTextStyle;
      const errors: Record<string, string> = {};

      if (!textVar.name?.trim()) {
        errors.name = 'Name is required';
      }

      if (!textVar.textSize || textVar.textSize <= 0) {
        errors.textSize = 'Text size must be greater than 0';
      }

      if (!textVar.fontFamily?.trim()) {
        errors.fontFamily = 'Font family is required';
      }

      if (textVar.strokeWidth < 0) {
        errors.strokeWidth = 'Stroke width cannot be negative';
      }

      return Object.keys(errors).length > 0 ? errors : null;
    },
  },
};

// Registry implementation
export const variableTypeRegistry: VariableTypeRegistry = {
  getConfig: (type: VariableType): VariableTypeConfig => {
    const config = variableTypeConfigs[type];
    if (!config) {
      throw new Error(`Unknown variable type: ${type}`);
    }
    return config;
  },

  getAllConfigs: (): VariableTypeConfig[] => {
    return Object.values(variableTypeConfigs);
  },

  getValidTypes: (): VariableType[] => {
    return Object.keys(variableTypeConfigs) as VariableType[];
  },

  isValidType: (type: string): type is VariableType => {
    return type in variableTypeConfigs;
  },
};
