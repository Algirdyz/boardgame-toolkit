import { AppShell, Box, Group, Title, ActionIcon, NavLink } from '@mantine/core';
import { IconArrowLeft, IconChevronRight } from '@tabler/icons-react';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

type SimpleAppShellProps = {
    children: React.ReactNode;
};

type Link = {
    href: string;
    label: string;
}

type SidebarProps = {
    children?: React.ReactNode;
    title: string;
    homeHref?: string;
    links?: Link[];
};

function Sidebar({ children, title, homeHref = '/', links = [] }: SidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const onHomePage = pathname === homeHref;

    const handleBack = () => {
        const parentPath = pathname.substring(0, pathname.lastIndexOf('/')) || '/';
        router.push(parentPath);
    };

    return (
        <>
            <Group>
                {!onHomePage && (
                    <ActionIcon onClick={handleBack} variant="subtle" aria-label="Back">
                        <IconArrowLeft />
                    </ActionIcon>
                )}
                <Title order={2}>{title}</Title>
            </Group>
            {links.length > 0 ? (
                <Box mt="md">
                    {links.map((link) => (
                        <NavLink
                            key={link.href}
                            href={link.href}
                            label={link.label}
                            active={pathname === link.href}
                            rightSection={
                                <IconChevronRight size={12} stroke={1.5} className="mantine-rotate-rtl" />
                            }

                        />
                    ))}
                </Box>
            ) : (
                children
            )}
        </>
    );
}

function Body({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

export function SimpleAppShell({ children }: SimpleAppShellProps) {
    const sidebar = React.Children.toArray(children).find(
        (child) => (child as React.ReactElement).type === Sidebar
    );
    const body = React.Children.toArray(children).find(
        (child) => (child as React.ReactElement).type === Body
    );

    return (
        <AppShell
            navbar={{ width: 300, breakpoint: 'sm' }}
            p={0}
        >
            <AppShell.Navbar p="xs">{sidebar}</AppShell.Navbar>
            <AppShell.Main>
                <Box h="calc(100vh - var(--app-shell-header-height, 0px) - var(--app-shell-footer-height, 0px) - 10px) " p={0} m={0}>
                    {body}
                </Box>
            </AppShell.Main>
        </AppShell>
    );
}

SimpleAppShell.Sidebar = Sidebar;
SimpleAppShell.Body = Body;
