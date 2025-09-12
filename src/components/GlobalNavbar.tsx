// components/GlobalNavbar.tsx
'use client';

import { Group, NavLink } from '@mantine/core';
import { IconGlobe, IconHome, IconPlus, IconSettings, IconTemplate } from '@tabler/icons-react';
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
        to="/templates"
        label="Templates"
        leftSection={<IconTemplate size="1rem" stroke={1.5} />}
      />
      <NavLink
        w="fit-content"
        component={Link}
        to="/tile"
        label="Tiles"
        leftSection={<IconTemplate size="1rem" stroke={1.5} />}
      />
      <NavLink
        w="fit-content"
        component={Link}
        to="/component"
        label="Components"
        leftSection={<IconPlus size="1rem" stroke={1.5} />}
      />

      <NavLink
        w="fit-content"
        component={Link}
        to="/globals"
        label="Globals"
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
