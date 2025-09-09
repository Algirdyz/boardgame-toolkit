import { MantineProvider } from '@mantine/core'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { SharedAppShell } from '../components/SharedAppShell'

import '@mantine/core/styles.css';
import { NavbarContentProvider } from '@/context/NavbarContentContext';

const RootLayout = () => (
  <>
    <MantineProvider>
      <NavbarContentProvider>
        <SharedAppShell>
          <Outlet />
        </SharedAppShell>
      </NavbarContentProvider>
    </MantineProvider>
    <TanStackRouterDevtools />
  </>
)

export const Route = createRootRoute({ component: RootLayout })
