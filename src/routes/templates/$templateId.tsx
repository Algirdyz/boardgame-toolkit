import { useEffect, useState } from 'react';
import { ComponentTemplateSpecs } from '@shared/components';
import { TemplateDefinition } from '@shared/templates';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { getComponents } from '@/api/componentApi';
import { getTemplate, saveTemplate } from '@/api/templateApi';
import { EditorPageTemplate, TemplateBasicInfo, TemplateComponentsManager } from '@/components';
import TemplateCanvas from '@/components/canvas/TemplateCanvas';
import PendingComponent from '@/components/PendingComponent/PendingComponent';

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

  const save = useMutation({
    mutationFn: saveTemplate,
  });

  const onTemplateChange = (updatedTemplate: TemplateDefinition) => {
    // This is the source of truth for the editor's current state.
    setTemplate(updatedTemplate);
    save.mutate(updatedTemplate);
  };

  // Component management functions
  const addComponent = (componentId: number) => {
    const newInstanceId = `instance_${Date.now()}_${Math.random()}`;
    const defaultTemplateSpecs: ComponentTemplateSpecs = {
      position: { x: 50, y: 50, rotation: 0, scale: 1 },
      maxCount: 1,
      rows: 1,
      spacing: 10,
    };

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

    onTemplateChange({
      ...template,
      components: {
        ...template.components,
        [instanceId]: {
          ...instance,
          templateSpecs: {
            ...instance.templateSpecs,
            ...updates,
          },
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
          availableComponents={components.data || []}
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
      canvasElement={(width, height) => (
        <TemplateCanvas
          template={template}
          onTemplateChange={onTemplateChange}
          width={width}
          height={height}
          editLocked={editLocked}
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
