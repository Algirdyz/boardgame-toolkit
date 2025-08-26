'use client';

import { AppShell, Box } from '@mantine/core';
import TemplateList from './TemplateList';

const TemplatesPage = () => {
    return (
        <AppShell
            header={{ height: 60 }}
            padding={0}
        >
            <AppShell.Header>
                test
            </AppShell.Header>
            <AppShell.Navbar p="md">
                <TemplateList />
            </AppShell.Navbar>
            <AppShell.Main>
                <Box />
            </AppShell.Main>
        </AppShell>
    )
};

export default TemplatesPage;
