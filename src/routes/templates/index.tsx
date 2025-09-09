import { useState } from 'react';
import { TemplateDefinition } from '@shared/templates';
import { Button, Center, Container, Loader, Modal, TextInput, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { getTemplates, saveTemplate } from '@/api/templateApi';
import NavigationGrid, { NavigationCard } from '@/components/NavigationGrid/NavigationGrid';

export const Route = createFileRoute('/templates/')({
  component: Templates,
});

function Templates() {
  const navigate = useNavigate({ from: '/templates' });

  const [opened, { open, close }] = useDisclosure(false);
  const [name, setName] = useState('');

  const templates = useQuery({ queryKey: ['templates'], queryFn: getTemplates });
  const save = useMutation({ mutationFn: saveTemplate });

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
        link: `/templates/${t.id}`,
      }))
    : [];

  return (
    <Container>
      <Modal opened={opened} onClose={close} title="New Template">
        <TextInput
          label="Template Name"
          placeholder="Enter template name"
          mb="md"
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <Button
          onClick={async () => {
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
            templates.refetch();
            navigate({ to: `/templates/${savedTemplate.id}` });
          }}
        >
          Create
        </Button>
      </Modal>
      <Title order={2} mb="md">
        Templates
      </Title>
      <Button mb="md" onClick={open} leftSection={<IconPlus />}>
        Create New Template
      </Button>
      <NavigationGrid cards={cards} />
    </Container>
  );
}
