import { useState } from 'react';
import { ComponentStaticSpecs } from '@shared/components';
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
import { deleteComponent, getComponents, saveComponent } from '@/api/componentApi';
import NavigationGrid, { NavigationCard } from '@/components/NavigationGrid/NavigationGrid';

export const Route = createFileRoute('/components/')({
  component: Components,
});

function Components() {
  const navigate = useNavigate({ from: '/components' });
  const queryClient = useQueryClient();

  const [opened, { open, close }] = useDisclosure(false);
  const [name, setName] = useState('');

  const components = useQuery({
    queryKey: ['components'],
    queryFn: getComponents,
  });

  const save = useMutation({
    mutationFn: saveComponent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
    },
  });

  const deleteComponentMutation = useMutation({
    mutationFn: deleteComponent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
    },
  });

  if (components.isLoading)
    return (
      <Center>
        <Loader />
      </Center>
    );
  if (components.isError) return <div>Error loading components</div>;

  const cards: NavigationCard[] = components.data
    ? components.data.map((c) => ({
        title: c.name,
        subtitle: c.description,
        link: `/components/${c.id}`,
        onDelete: c.id ? () => deleteComponentMutation.mutate(c.id!) : undefined,
      }))
    : [];

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Modal opened={opened} onClose={close} title="New Component">
          <TextInput
            label="Component Name"
            placeholder="Enter component name (e.g., Worker Slot, Resource Icon)"
            mb="md"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <Button
            onClick={async () => {
              const defaultComponent: ComponentStaticSpecs = {
                name,
                description: '',
                shapeId: 1, // Default to first shape
                choices: [
                  {
                    id: 1,
                    name: 'Default',
                    description: '',
                    fillColorId: 1,
                    strokeColorId: 1,
                  },
                ],
              };
              const savedComponent = await save.mutateAsync(defaultComponent);
              close();
              setName('');
              navigate({ to: `/components/${savedComponent.id}` });
            }}
            disabled={!name.trim()}
          >
            Create
          </Button>
        </Modal>

        <Group justify="space-between" align="center">
          <div>
            <Title order={1}>Components</Title>
            <Text c="dimmed" mt="xs">
              Define reusable variables for colors, shapes, dimensions, and names that can be used
              throughout your project.
            </Text>
          </div>

          <Button onClick={open} leftSection={<IconPlus />}>
            Create New Component
          </Button>
        </Group>
        <NavigationGrid cards={cards} columns={3} />
      </Stack>
    </Container>
  );
}
