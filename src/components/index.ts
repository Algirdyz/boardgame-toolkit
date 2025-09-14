export { OverviewPageTemplate } from './OverviewPageTemplate/OverviewPageTemplate';
export { EditorPageTemplate } from './EditorPageTemplate/EditorPageTemplate';
export type { NavigationCard } from './NavigationGrid/NavigationGrid';
export { default as NavigationGrid } from './NavigationGrid/NavigationGrid';
export { GlobalNavbar } from './GlobalNavbar';
export { SharedAppShell } from './SharedAppShell';

// Canvas Components
export { default as TileCanvas } from './canvas/TileCanvas';
export { MapCanvas } from './canvas/MapCanvas';
export { CellTypePalette } from './canvas/CellTypePalette';

// Map Components
export { CellTypesManager } from './CellTypesManager';

// Variable Selectors
export {
  ColorVariableSelector,
  ShapeVariableSelector,
  DimensionVariableSelector,
  NameVariableSelector,
} from './VariableSelectors';

// Template Editor Components
export {
  TemplateBasicInfo,
  TemplateComponentsManager,
  TemplateShapeSettings,
} from './TemplateEditor';
