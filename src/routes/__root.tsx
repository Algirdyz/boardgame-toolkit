import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import { SharedAppShell } from '../components/SharedAppShell';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { NavbarContentProvider } from '@/context/NavbarContentContext';

const RootLayout = () => (
  <>
    <MantineProvider>
      <ModalsProvider>
        <NavbarContentProvider>
          <SharedAppShell>
            <Outlet />
          </SharedAppShell>
        </NavbarContentProvider>
        <Notifications />
      </ModalsProvider>
    </MantineProvider>
    <TanStackRouterDevtools />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
