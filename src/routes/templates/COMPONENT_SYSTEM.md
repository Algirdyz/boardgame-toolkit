# Template Editor - New Component System

The template editor has been updated to use the new generic component system instead of hardcoded worker slots, names, and resource lists.

## Key Features

### 1. Add Components to Template

- **Component Selection**: Dropdown showing all available components
- **Easy Addition**: Click to add any component to the template
- **No Duplicates**: Same component can be added multiple times as different instances

### 2. Component Configuration UI

For each component instance, you can configure:

- **Max Count**: Maximum number of this component that can be placed
- **Rows**: Number of rows for grid layout
- **Spacing**: Spacing between component instances
- **Position**: Currently shown read-only, will be editable via canvas later

### 3. Component Management

- **Delete**: Remove component instances from the template
- **Update**: Modify configuration values in real-time
- **Visual Feedback**: Each component is shown in its own bordered container

### 4. Template Structure

The new `TemplateDefinition` includes:

```typescript
{
  id?: number;
  name: string;
  shape: GridPosition[];
  components: {
    [instanceId: string]: {
      componentId: number;
      templateSpecs: ComponentTemplateSpecs;
    };
  };
}
```

## Usage Flow

1. **Create Template**: Start with basic template (name + shape)
2. **Add Components**: Use dropdown to add components from the library
3. **Configure Each Component**:
   - Set how many instances can be placed (maxCount)
   - Define grid layout (rows, spacing)
   - Position will be set via canvas interaction (coming next)
4. **Save**: All changes auto-save as you work

## Component Template Specs

Each component instance has these configurable properties:

- `position`: Canvas position (x, y, rotation, scale)
- `maxCount`: Maximum instances allowed
- `rows`: Grid layout rows
- `spacing`: Spacing between instances

## Next Steps

The following features are planned:

1. **Canvas Integration**: Click and drag to position components on the template
2. **Visual Preview**: See component previews on the canvas
3. **Grid Snapping**: Snap components to grid positions
4. **Validation**: Ensure components don't overlap or go out of bounds

## Migration from Old System

The old hardcoded system with `workerDefinition`, `nameDefinition`, and `resourceListDefinition` has been replaced with the generic `components` object that can handle any type of component.

This provides much more flexibility and reusability across different template types.
