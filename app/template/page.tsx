'use client';

import { SimpleAppShell } from '@/components/SimpleAppShell';
import { Box } from '@mantine/core';

const TemplatesPage = () => {
    return (
        <SimpleAppShell>
            <SimpleAppShell.Sidebar title="Templates" links={[
                { href: '/template/1x1', label: 'Edit [1x1]' },
                { href: '/template/2x2', label: 'Edit [2x2]' },
                { href: '/template/1x2', label: 'Edit [1x2]' },
                { href: '/template/L', label: 'Edit [L]' },
                { href: '/template/T', label: 'Edit [T]' },
            ]} />
            <SimpleAppShell.Body>
                <Box />
            </SimpleAppShell.Body>
        </SimpleAppShell>
    )
};

export default TemplatesPage;
