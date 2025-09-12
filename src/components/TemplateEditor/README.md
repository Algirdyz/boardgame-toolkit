# Template Editor - Sidebar Components

The template editor sidebar has been refactored into separate, reusable components for better maintainability and organization.

## Component Structure

### `TemplateBasicInfo`

**Location**: `src/components/TemplateEditor/TemplateBasicInfo.tsx`

Handles the basic template information editing:

- Template name input
- Simple, focused component for template metadata

**Props**:

```typescript
interface TemplateBasicInfoProps {
  template: TemplateDefinition;
  onTemplateChange: (template: TemplateDefinition) => void;
}
```

**Usage**:

```tsx
<TemplateBasicInfo template={template} onTemplateChange={onTemplateChange} />
```

### `TemplateComponentsManager`

**Location**: `src/components/TemplateEditor/TemplateComponentsManager.tsx`

Handles all component management functionality:

- Component selection dropdown
- Adding components to template
- Configuring component template specs (maxCount, rows, spacing)
- Removing components
- Displaying component instances with their configurations

**Props**:

```typescript
interface TemplateComponentsManagerProps {
  template: TemplateDefinition;
  onTemplateChange: (template: TemplateDefinition) => void;
  availableComponents: ComponentStaticSpecs[];
  onAddComponent: (componentId: number) => void;
  onUpdateComponentSpecs: (instanceId: string, updates: Partial<ComponentTemplateSpecs>) => void;
  onRemoveComponent: (instanceId: string) => void;
}
```

**Usage**:

```tsx
<TemplateComponentsManager
  template={template}
  onTemplateChange={onTemplateChange}
  availableComponents={components.data || []}
  onAddComponent={addComponent}
  onUpdateComponentSpecs={updateComponentTemplateSpecs}
  onRemoveComponent={removeComponent}
/>
```

## Benefits of Separation

### 1. **Modularity**

- Each component has a single responsibility
- Easier to test individual components
- Better code organization

### 2. **Reusability**

- Components can be reused in different contexts
- Easier to create different template editor layouts
- Components are self-contained

### 3. **Maintainability**

- Changes to one section don't affect others
- Easier to debug and modify specific functionality
- Clear separation of concerns

### 4. **Extensibility**

- Easy to add new sidebar sections
- Can easily swap out or enhance individual components
- Flexible component composition

## File Organization

```
src/components/TemplateEditor/
├── index.ts                     # Exports all template editor components
├── TemplateBasicInfo.tsx        # Basic template information
└── TemplateComponentsManager.tsx # Component management functionality
```

## Integration

The components are integrated into the main template editor through the `templateSections` array:

```tsx
const templateSections = [
  {
    title: 'Basic Information',
    content: <TemplateBasicInfo template={template} onTemplateChange={onTemplateChange} />,
  },
  {
    title: 'Components',
    content: (
      <TemplateComponentsManager
        template={template}
        onTemplateChange={onTemplateChange}
        availableComponents={components.data || []}
        onAddComponent={addComponent}
        onUpdateComponentSpecs={updateComponentTemplateSpecs}
        onRemoveComponent={removeComponent}
      />
    ),
  },
];
```

This structure makes it easy to:

- Add new sections by creating new components
- Reorder sections by changing the array
- Conditionally show/hide sections based on user permissions or template state
- A/B test different sidebar layouts

## Future Enhancements

The modular structure makes it easy to add new features:

- **Component Templates**: Pre-configured component sets
- **Validation**: Real-time validation feedback
- **Preview**: Component preview thumbnails
- **Grouping**: Organize components by category
- **Search**: Filter components by name or type
- **Favorites**: Save frequently used components
