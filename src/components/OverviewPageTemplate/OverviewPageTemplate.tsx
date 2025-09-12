import { ReactNode } from 'react';
import { Button, Container, Group, Modal, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import NavigationGrid, { NavigationCard } from '../NavigationGrid/NavigationGrid';

interface OverviewPageTemplateProps {
  // Page content
  title: string;
  description: string;
  cards: NavigationCard[];
  columns?: number;

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
  isLoading?: boolean;

  // Optional additional modal content
  additionalModalContent?: ReactNode;
}

export function OverviewPageTemplate({
  title,
  description,
  cards,
  columns = 3,
  modalTitle,
  modalPlaceholder,
  createButtonText,
  opened,
  onClose,
  onOpen,
  name,
  onNameChange,
  onSubmit,
  isLoading = false,
  additionalModalContent,
}: OverviewPageTemplateProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && name.trim()) {
      onSubmit();
    }
  };

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
            <Button onClick={onSubmit} disabled={!name.trim()} loading={isLoading}>
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

        <NavigationGrid cards={cards} columns={columns} />
      </Stack>
    </Container>
  );
}
