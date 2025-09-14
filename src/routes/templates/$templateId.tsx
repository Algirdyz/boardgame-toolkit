import { useEffect, useState } from 'react';
import { ComponentTemplateSpecs } from '@shared/components';
import { TemplateDefinition } from '@shared/templates';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { getComponents } from '@/api/componentApi';
import { getTemplate, saveTemplate } from '@/api/templateApi';
import { getVariables } from '@/api/variablesApi';
import { EditorPageTemplate, TemplateBasicInfo, TemplateComponentsManager } from '@/components';
import TemplateCanvas from '@/components/canvas/TemplateCanvas';
import PendingComponent from '@/components/PendingComponent/PendingComponent';
import { createDefaultTemplateSpecs, updateTemplateSpecs } from '@/lib/componentInstanceUtils';

export const Route = createFileRoute('/templates/$templateId')({
  component: RouteComponent,
  pendingComponent: PendingComponent,
  loader: ({ params }) => {
    const templateId = parseInt(params.templateId, 10);
    return getTemplate(templateId);
  },
});

function RouteComponent() {
  const [editLocked, setEditLocked] = useState(true);
  const loadedTemplate = Route.useLoaderData();

  const [template, setTemplate] = useState<TemplateDefinition>(loadedTemplate);
  useEffect(() => {
    setTemplate(loadedTemplate);
  }, [loadedTemplate]);

  // Load available components
  const components = useQuery({
    queryKey: ['components'],
    queryFn: getComponents,
  });

  // Load variables for component rendering
  const variables = useQuery({
    queryKey: ['variables'],
    queryFn: getVariables,
  });

  const save = useMutation({
    mutationFn: saveTemplate,
  });

  // Simple loading state
  const onTemplateChange = (updatedTemplate: TemplateDefinition) => {
    // This is the source of truth for the editor's current state.
    setTemplate(updatedTemplate);
    save.mutate(updatedTemplate);
  };

  // Component management functions
  const addComponent = (componentId: number) => {
    const newInstanceId = `instance_${Date.now()}_${Math.random()}`;

    // Calculate a better starting position to avoid overlap
    const existingComponents = Object.values(template.components);
    const baseX = 100;
    const baseY = 100;
    const offsetX = (existingComponents.length % 3) * 150; // 3 components per row
    const offsetY = Math.floor(existingComponents.length / 3) * 150; // New row every 3 components

    const defaultPosition = {
      x: baseX + offsetX,
      y: baseY + offsetY,
      rotation: 0,
      scale: 1,
    };

    const defaultTemplateSpecs = createDefaultTemplateSpecs(defaultPosition);

    onTemplateChange({
      ...template,
      components: {
        ...template.components,
        [newInstanceId]: {
          componentId,
          templateSpecs: defaultTemplateSpecs,
        },
      },
    });
  };

  const updateComponentTemplateSpecs = (
    instanceId: string,
    updates: Partial<ComponentTemplateSpecs>
  ) => {
    const instance = template.components[instanceId];
    if (!instance) return;

    const updatedSpecs = updateTemplateSpecs(updates, instance.templateSpecs);

    onTemplateChange({
      ...template,
      components: {
        ...template.components,
        [instanceId]: {
          ...instance,
          templateSpecs: updatedSpecs,
        },
      },
    });
  };

  const removeComponent = (instanceId: string) => {
    const { [instanceId]: removed, ...remainingComponents } = template.components;
    onTemplateChange({
      ...template,
      components: remainingComponents,
    });
  };

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
          availableComponents={components.data!}
          onAddComponent={addComponent}
          onUpdateComponentSpecs={updateComponentTemplateSpecs}
          onRemoveComponent={removeComponent}
        />
      ),
    },
  ];

  return (
    <EditorPageTemplate
      title="Template Editor"
      loading={components.isLoading || variables.isLoading}
      canvasElement={(width, height) => (
        <TemplateCanvas
          template={template}
          onTemplateChange={onTemplateChange}
          width={width}
          height={height}
          editLocked={editLocked}
          availableComponents={components.data!}
          variables={variables.data!}
        />
      )}
      onSave={() => save.mutate(template)}
      isSaving={save.isPending}
      editLocked={!editLocked}
      onEditLockChange={(locked) => setEditLocked(!locked)}
      editLockLabel="Edit Shape"
      sections={templateSections}
    />
  );
}
