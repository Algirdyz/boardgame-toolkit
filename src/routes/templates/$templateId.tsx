import { useEffect, useState } from 'react';
import { TemplateDefinition } from '@shared/templates';
import { TextInput } from '@mantine/core';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { getTemplate, saveTemplate } from '@/api/templateApi';
import { EditorPageTemplate } from '@/components';
import TemplateCanvas from '@/components/canvas/TemplateCanvas';
import PendingComponent from '@/components/PendingComponent/PendingComponent';
import ResourceEditor from '@/components/tileComponents/resourceCost/resourceEditor';
import WorkerConfig from '@/components/tileComponents/workerSlots/WorkerConfig';

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
    console.log('Loaded template:', loadedTemplate.workerDefinition?.maxCount);
    setTemplate(loadedTemplate);
  }, [loadedTemplate]);

  const save = useMutation({
    mutationFn: saveTemplate,
  });

  const onTemplateChange = (updatedTemplate: TemplateDefinition) => {
    // This is the source of truth for the editor's current state.
    setTemplate(updatedTemplate);
    save.mutate(updatedTemplate);
  };

  const templateSections = [
    {
      title: 'Basic Information',
      content: (
        <TextInput
          label="Template Name"
          value={template.name}
          onChange={(e) =>
            onTemplateChange({
              ...template,
              name: e.target.value,
            })
          }
        />
      ),
    },
    {
      title: 'Worker Configuration',
      content: (
        <WorkerConfig
          definition={template.workerDefinition}
          onChange={(workerDefinition) => onTemplateChange({ ...template, workerDefinition })}
        />
      ),
    },
    {
      title: 'Resource Configuration',
      content: (
        <ResourceEditor
          definition={template.resourceListDefinition}
          onChange={(resourceListDefinition) =>
            onTemplateChange({ ...template, resourceListDefinition })
          }
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
