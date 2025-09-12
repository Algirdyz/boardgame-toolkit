import { useState } from 'react';
import { TemplateDefinition } from '@shared/templates';
import { Center, Loader } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { deleteTemplate, getTemplates, saveTemplate } from '@/api/templateApi';
import { OverviewPageTemplate, type NavigationCard } from '@/components';

export const Route = createFileRoute('/templates/')({
  component: Templates,
});

function Templates() {
  const navigate = useNavigate({ from: '/templates' });
  const queryClient = useQueryClient();

  const [opened, { open, close }] = useDisclosure(false);
  const [name, setName] = useState('');

  const templates = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates,
  });

  const save = useMutation({
    mutationFn: saveTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const handleCreateTemplate = async () => {
    if (!name.trim()) return;

    const defaultTemplate: TemplateDefinition = {
      name,
      shape: [{ x: 0, y: 0 }],
      workerDefinition: {
        enabled: true,
        maxCount: 5,
        rows: 1,
        spacing: 10,
        workerSlotPositions: { x: 10, y: 10 },
      },
      nameDefinition: { enabled: true, position: { x: 10, y: 50 }, maxWidth: 100 },
      resourceListDefinition: {
        enabled: true,
        resources: [
          { color: 'red', amount: 2, shape: 'circle' },
          { color: 'blue', amount: 1, shape: 'rect' },
        ],
        spacing: 10,
        position: { x: 10, y: 10 },
      },
    };
    const savedTemplate = await save.mutateAsync(defaultTemplate);
    close();
    setName('');
    navigate({ to: `/templates/${savedTemplate.id}` });
  };

  if (templates.isLoading)
    return (
      <Center>
        <Loader />
      </Center>
    );
  if (templates.isError) return <div>Error loading templates</div>;

  const cards: NavigationCard[] = templates.data
    ? templates.data.map((t) => ({
        title: t.name,
        subtitle: `${t.shape.length} shape points`,
        link: `/templates/${t.id}`,
        onDelete: t.id ? () => deleteTemplateMutation.mutate(t.id!) : undefined,
      }))
    : [];

  return (
    <OverviewPageTemplate
      title="Templates"
      description="Create and manage game board templates with customizable shapes, worker slots, and resource layouts."
      cards={cards}
      columns={3}
      modalTitle="New Template"
      modalPlaceholder="Enter template name (e.g., Card Template, Token Layout)"
      createButtonText="Create New Template"
      opened={opened}
      onClose={close}
      onOpen={open}
      name={name}
      onNameChange={setName}
      onSubmit={handleCreateTemplate}
      isLoading={save.isPending}
    />
  );
}
