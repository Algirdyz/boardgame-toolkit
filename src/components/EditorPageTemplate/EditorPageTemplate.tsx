import { ReactNode } from 'react';
import { Box, Button, Flex, Group, Paper, Stack, Switch, Title } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { IconDeviceFloppy } from '@tabler/icons-react';

interface EditorPageTemplateProps {
  // Editor configuration
  title: string;

  // Canvas/main content area - function that receives width and height
  canvasElement: (width: number, height: number) => ReactNode;

  // Save functionality
  onSave: () => void;
  isSaving?: boolean;

  // Edit lock functionality
  editLocked: boolean;
  onEditLockChange: (locked: boolean) => void;
  editLockLabel?: string;

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
  onSave,
  isSaving = false,
  editLocked,
  onEditLockChange,
  editLockLabel = 'Lock Edit',
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
            <Switch
              label={editLockLabel}
              checked={editLocked}
              onChange={(event) => onEditLockChange(event.currentTarget.checked)}
            />
          </Group>

          <Paper p="md" withBorder>
            <Stack gap="md">
              <Title order={4}>Actions</Title>
              <Button
                fullWidth
                loading={isSaving}
                leftSection={<IconDeviceFloppy />}
                onClick={onSave}
                disabled={isSaving}
              >
                Save
              </Button>
            </Stack>
          </Paper>

          {sections.map((section, index) => (
            <Paper key={index} p="md" withBorder>
              <Stack gap="md">
                <Title order={4}>{section.title}</Title>
                {section.content}
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Box>

      <Box ref={ref} style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
        {canvasElement(width, height)}
      </Box>
    </Flex>
  );
}
