import { ReactNode, useState } from 'react';
import { ActionIcon, Collapse, Group, Stack, Text } from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';

interface ComponentRowProps {
  /** The name to display in the row */
  name: string;
  /** The settings content to show when expanded */
  children: ReactNode;
  /** Controlled expanded state (enabled/disabled component) */
  expanded?: boolean;
  /** Optional initial expanded state (only used when expanded prop is not provided) */
  defaultExpanded?: boolean;
  /** Callback when expanded state changes */
  onToggle?: (expanded: boolean) => void;
}

/**
 * A compound component that renders as a row with a name and toggle icon.
 * When the icon is clicked, it expands to show the component's settings.
 * The expanded state represents whether the component is enabled/disabled.
 */
export function ComponentRow({
  name,
  children,
  expanded: controlledExpanded,
  defaultExpanded = false,
  onToggle,
}: ComponentRowProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);

  // Use controlled state if provided, otherwise use internal state
  const expanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const isControlled = controlledExpanded !== undefined;

  const handleToggle = () => {
    const newExpanded = !expanded;

    if (!isControlled) {
      setInternalExpanded(newExpanded);
    }

    onToggle?.(newExpanded);
  };

  return (
    <div>
      <Group justify="space-between" wrap="nowrap" mb="xs">
        <Text fw={500} size="sm">
          {name}
        </Text>
        <ActionIcon
          variant="subtle"
          color={expanded ? 'red' : 'green'}
          size="sm"
          onClick={handleToggle}
          aria-label={expanded ? `Disable ${name} component` : `Enable ${name} component`}
        >
          {expanded ? <IconX size="1rem" /> : <IconPlus size="1rem" />}
        </ActionIcon>
      </Group>

      <Collapse in={expanded}>
        <div style={{ paddingLeft: 'var(--mantine-spacing-md)' }}>
          <Stack gap="xs">{children}</Stack>
        </div>
      </Collapse>
    </div>
  );
}
