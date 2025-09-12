import { useState } from 'react';
import { TemplateDefinition } from '@shared/templates';
import {
  Button,
  Center,
  Container,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { deleteTemplate, getTemplates, saveTemplate } from '@/api/templateApi';
import NavigationGrid, { NavigationCard } from '@/components/NavigationGrid/NavigationGrid';

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
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Modal opened={opened} onClose={close} title="New Template">
          <TextInput
            label="Template Name"
            placeholder="Enter template name (e.g., Card Template, Token Layout)"
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
              setName('');
              navigate({ to: `/templates/${savedTemplate.id}` });
            }}
            disabled={!name.trim()}
          >
            Create
          </Button>
        </Modal>

        <Group justify="space-between" align="center">
          <div>
            <Title order={1}>Templates</Title>
            <Text c="dimmed" mt="xs">
              Create and manage game board templates with customizable shapes, worker slots, and
              resource layouts.
            </Text>
          </div>

          <Button onClick={open} leftSection={<IconPlus />}>
            Create New Template
          </Button>
        </Group>
        <NavigationGrid cards={cards} columns={3} />
      </Stack>
    </Container>
  );
}
