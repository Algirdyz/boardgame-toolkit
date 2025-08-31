'use client';

import { getDefaultTemplate } from '@/components/lib/shapes';
import { TemplateType } from '@/components/lib/templateTypes';
import TemplateCanvas from '@/app/template/[templateType]/TemplateCanvas';
import TemplateEditor from '@/app/template/[templateType]/TemplateEditor';
import { SimpleAppShell } from '@/components/SimpleAppShell';
import { Box } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useState } from 'react';

const TemplatePage = () => {
    const params = useParams<{ templateType: TemplateType }>();
    const [template, setTemplate] = useState(getDefaultTemplate(params.templateType));
    if (!template) {
        return <div>Template not found</div>;
    }
    return (
        <SimpleAppShell>
            <SimpleAppShell.Sidebar title={`Template: ${template.type}`}>
                <TemplateEditor
                    template={template}
                    setTemplate={setTemplate}
                />
            </SimpleAppShell.Sidebar>
            <SimpleAppShell.Body>
                <Box h="calc(100vh - var(--app-shell-header-height, 0px) - var(--app-shell-footer-height, 0px) - 10px) " p={0} m={0}>
                    <TemplateCanvas template={template} />
                </Box>
            </SimpleAppShell.Body>
        </SimpleAppShell>
    )
};

export default TemplatePage;
