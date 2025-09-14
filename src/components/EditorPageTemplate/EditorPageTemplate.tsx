import { ReactNode } from 'react';
import { Box, Center, Flex, Group, Loader, Paper, Stack, Switch, Title } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';

interface EditorPageTemplateProps {
  // Editor configuration
  title: string;

  // Canvas/main content area - function that receives width and height
  canvasElement: (width: number, height: number) => ReactNode;

  // Loading state
  loading?: boolean;

  // Save functionality
  onSave: () => void;
  isSaving?: boolean;

  // Edit lock functionality (optional)
  editLocked?: boolean;
  onEditLockChange?: (locked: boolean) => void;
  editLockLabel?: string;
  showEditLock?: boolean;

  // Sidebar content sections
  sections: {
    title: string;
    content: ReactNode;
  }[];

  // Optional sidebar configuration
  sidebarWidth?: number;
}

export function EditorPageTemplate({
  title,
  canvasElement,
  loading = false,
  onSave: _onSave,
  isSaving: _isSaving = false,
  editLocked = false,
  onEditLockChange,
  editLockLabel = 'Lock Edit',
  showEditLock = true,
  sections,
  sidebarWidth = 350,
}: EditorPageTemplateProps) {
  const { ref, width, height } = useElementSize();

  return (
    <Flex style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Box
        style={{
          width: `${sidebarWidth}px`,
          height: '100%',
          flexShrink: 0,
          overflow: 'auto',
          borderRight: '1px solid #dee2e6',
          backgroundColor: '#f8f9fa',
        }}
      >
        <Stack gap="md" p="md">
          <Group justify="space-between">
            <Title order={3}>{title}</Title>
            {showEditLock && onEditLockChange && !loading && (
              <Switch
                label={editLockLabel}
                checked={editLocked}
                onChange={(event) => onEditLockChange(event.currentTarget.checked)}
              />
            )}
          </Group>

          {loading ? (
            <Paper p="md" withBorder>
              <Center>
                <Loader />
              </Center>
            </Paper>
          ) : (
            sections.map((section, index) => (
              <Paper key={index} p="md" withBorder>
                <Stack gap="md">
                  <Title order={4}>{section.title}</Title>
                  {section.content}
                </Stack>
              </Paper>
            ))
          )}
        </Stack>
      </Box>

      <Box ref={ref} style={{ flex: 1, height: '100%', overflow: 'hidden', minHeight: '400px' }}>
        {loading ? (
          <Center style={{ width: '100%', height: '100%' }}>
            <Loader size="xl" />
          </Center>
        ) : width > 0 && height > 0 ? (
          canvasElement(width, height)
        ) : null}
      </Box>
    </Flex>
  );
}
