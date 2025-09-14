import { ReactNode } from 'react';
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
import { IconPlus } from '@tabler/icons-react';
import NavigationGrid, { NavigationCard } from '../NavigationGrid/NavigationGrid';

interface OverviewPageTemplateProps {
  // Page content
  title: string;
  description: string;
  cards: NavigationCard[];
  columns?: number;
  loading?: boolean;
  isError?: boolean;

  // Modal configuration
  modalTitle: string;
  modalPlaceholder: string;
  createButtonText: string;

  // Modal state
  opened: boolean;
  onClose: () => void;
  onOpen: () => void;

  // Form handling
  name: string;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
  createPending?: boolean;

  // Optional additional modal content
  additionalModalContent?: ReactNode;
}

export function OverviewPageTemplate({
  title,
  description,
  cards,
  columns = 3,
  loading = false,
  isError = false,
  modalTitle,
  modalPlaceholder,
  createButtonText,
  opened,
  onClose,
  onOpen,
  name,
  onNameChange,
  onSubmit,
  createPending = false,
  additionalModalContent,
}: OverviewPageTemplateProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && name.trim()) {
      onSubmit();
    }
  };

  if (loading) {
    return (
      <Container size="lg" py="xl">
        <Stack gap="xl">
          <Group justify="space-between" align="center">
            <div>
              <Title order={1}>{title}</Title>
              <Text c="dimmed" mt="xs">
                {description}
              </Text>
            </div>
            <Button disabled leftSection={<IconPlus />}>
              {createButtonText}
            </Button>
          </Group>
          <Center py="xl">
            <Loader />
          </Center>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Modal opened={opened} onClose={onClose} title={modalTitle}>
          <TextInput
            label={`${modalTitle.replace('New ', '')} Name`}
            placeholder={modalPlaceholder}
            mb="md"
            value={name}
            onChange={(e) => onNameChange(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />

          {additionalModalContent}

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={!name.trim()} loading={createPending}>
              Create
            </Button>
          </Group>
        </Modal>

        <Group justify="space-between" align="center">
          <div>
            <Title order={1}>{title}</Title>
            <Text c="dimmed" mt="xs">
              {description}
            </Text>
          </div>

          <Button onClick={onOpen} leftSection={<IconPlus />}>
            {createButtonText}
          </Button>
        </Group>

        {isError && (
          <Text c="red" size="sm">
            There was an error loading data.
          </Text>
        )}
        {loading && (
          <Center py="xl">
            <Loader />
          </Center>
        )}
        {!loading && !isError && <NavigationGrid cards={cards} columns={columns} />}
      </Stack>
    </Container>
  );
}
