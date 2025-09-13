// components/GlobalNavbar.tsx
'use client';

import { Group, NavLink } from '@mantine/core';
import {
  IconComponents,
  IconGlobe,
  IconGrid3x3,
  IconHome,
  IconSettings,
  IconTemplate,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';

export function GlobalNavbar() {
  return (
    <Group>
      <NavLink
        w="fit-content"
        component={Link}
        to="/"
        label="Home"
        leftSection={<IconHome size="1rem" stroke={1.5} />}
      />
      <NavLink
        w="fit-content"
        component={Link}
        to="/tiles"
        label="Tiles"
        leftSection={<IconGrid3x3 size="1rem" stroke={1.5} />}
      />
      <NavLink
        w="fit-content"
        component={Link}
        to="/templates"
        label="Templates"
        leftSection={<IconTemplate size="1rem" stroke={1.5} />}
      />
      <NavLink
        w="fit-content"
        component={Link}
        to="/components"
        label="Components"
        leftSection={<IconComponents size="1rem" stroke={1.5} />}
      />
      <NavLink
        w="fit-content"
        component={Link}
        to="/variables"
        label="Variables"
        leftSection={<IconGlobe size="1rem" stroke={1.5} />}
      />
      <NavLink
        w="fit-content"
        component={Link}
        to="/settings" // Example static link
        label="Settings"
        leftSection={<IconSettings size="1rem" stroke={1.5} />}
      />
    </Group>
  );
}
