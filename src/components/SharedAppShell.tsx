import { ReactNode } from 'react';
import { AppShell, Box, Burger, Group, Image } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from '@tanstack/react-router';
import { GlobalNavbar } from './GlobalNavbar';

export function SharedAppShell({ children }: { children: ReactNode }) {
  const [navbarOpened, { toggle: toggleNavbar }] = useDisclosure();
  // const { navbarContent } = useNavbarContent();

  // const asideVisible = asideContent !== null && asideContent !== undefined;

  return (
    <AppShell
      header={{ height: 60 }}
      // navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !navbarOpened } }}
      p={0}
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={navbarOpened} onClick={toggleNavbar} hiddenFrom="sm" size="sm" />
          <Group justify="space-between" w="100%" align="center">
            <Group style={{ flex: 1 }}>
              <Image src="/smalllogo.png" alt="Logo" h={30} w={30} />
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                Board Game Toolkit
              </Link>
            </Group>

            <GlobalNavbar />
          </Group>
        </Group>
      </AppShell.Header>

      {/* <AppShell.Navbar p="md">
        {navbarContent}
      </AppShell.Navbar> */}

      <AppShell.Main>
        <Box
          h="calc(100vh - var(--app-shell-header-height, 0px) - var(--app-shell-footer-height, 0px))"
          p={0}
          m={0}
        >
          {children}
        </Box>
      </AppShell.Main>
    </AppShell>
  );
}
