'use client';

import TemplateCanvas from '@/app/template/[templateType]/TemplateCanvas';
import TemplateEditor from '@/app/template/[templateType]/TemplateEditor';
import { getDefaultTemplate } from '@/app/lib/shapes';
import { TemplateType } from '@/app/lib/templateTypes';
import { AppShell, Box } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useState } from 'react';

const TemplatePage = () => {
    const params = useParams<{ templateType: TemplateType }>();
    const [template, setTemplate] = useState(getDefaultTemplate(params.templateType));
    if (!template) {
        return <div>Template not found</div>;
    }
    return (
        <AppShell
            header={{ height: 60 }}
            padding={0}
        >
            <AppShell.Header>
                test
            </AppShell.Header>
            <AppShell.Navbar p="md">
                <TemplateEditor
                    template={template}
                    setTemplate={setTemplate}
                />
            </AppShell.Navbar>
            <AppShell.Main>
                <Box h="calc(100vh - var(--app-shell-header-height, 0px) - var(--app-shell-footer-height, 0px) - 10px) " p={0} m={0}>
                    <TemplateCanvas template={template} />
                </Box>
            </AppShell.Main>
        </AppShell>
    )
};

export default TemplatePage;
