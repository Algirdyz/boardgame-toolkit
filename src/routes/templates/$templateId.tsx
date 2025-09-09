import { useState } from 'react';
import { TemplateDefinition } from '@shared/templates';
import { Box, Flex, Stack, Switch } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { getTemplate, saveTemplate } from '@/api/templateApi';
import TemplateCanvas from '@/components/canvas/TemplateCanvas';
import ResourceEditor from '@/components/tileComponents/resourceCost/resourceEditor';
import WorkerConfig from '@/components/tileComponents/workerSlots/WorkerConfig';

export const Route = createFileRoute('/templates/$templateId')({
  component: RouteComponent,
  loader: ({ params }) => {
    const templateId = parseInt(params.templateId, 10);
    return getTemplate(templateId);
  },
});

function RouteComponent() {
  const { ref, width, height } = useElementSize();
  const [editLocked, setEditLocked] = useState(true);

  const [template, setTemplate] = useState<TemplateDefinition>(Route.useLoaderData());
  const save = useMutation({ mutationFn: saveTemplate });

  const onTemplateChange = async (updatedTemplate: TemplateDefinition) => {
    setTemplate(updatedTemplate);
    await save.mutateAsync(updatedTemplate);
  };

  return (
    <Flex style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Box
        style={{
          width: '300px',
          height: '100%',
          flexShrink: 0,
          borderRight: '1px solid #eee',
          padding: '16px',
        }}
      >
        <Stack>
          <Switch
            label="Edit Shape"
            checked={!editLocked}
            onChange={(event) => setEditLocked(!event.currentTarget.checked)}
          />
          <WorkerConfig
            definition={template.workerDefinition}
            onChange={(workerDefinition) => onTemplateChange({ ...template, workerDefinition })}
          />
          <ResourceEditor
            definition={template.resourceListDefinition}
            onChange={(resourceListDefinition) =>
              onTemplateChange({ ...template, resourceListDefinition })
            }
          />
        </Stack>
        <div>Template Name: {template.name}</div>
      </Box>
      <Box ref={ref} style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
        <TemplateCanvas
          template={template}
          onTemplateChange={onTemplateChange}
          width={width}
          height={height}
          editLocked={editLocked}
        />
      </Box>
    </Flex>
  );
}
