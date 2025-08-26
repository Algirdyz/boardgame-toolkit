'use client';

import '@mantine/core/styles.css';
import { AppShell, Box, Burger, Group, MantineProvider, ColorSchemeScript, mantineHtmlProps } from '@mantine/core';
import { theme } from '../theme';
import Sidebar from './components/Sidebar';
import { useDisclosure } from '@mantine/hooks';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <title>Boardgame Toolkit</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
        <link rel="shortcut icon" href="/favicon.svg" />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <AppShell
            header={{ height: 60 }}
            navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            padding={0}

          >
            <AppShell.Header>
              <Group h="100%" px="md">
                <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
              </Group>
            </AppShell.Header>
            <AppShell.Navbar p="md">
              <Sidebar />
            </AppShell.Navbar>
            <AppShell.Main>
              <Box h="calc(100vh - var(--app-shell-header-height, 0px) - var(--app-shell-footer-height, 0px) - 10px) " p={0} m={0}>
                {children}
              </Box>
            </AppShell.Main>
          </AppShell>
        </MantineProvider>
      </body>
    </html>
  );
}
