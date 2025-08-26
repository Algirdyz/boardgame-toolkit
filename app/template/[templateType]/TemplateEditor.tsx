import { Button, Group, Stack, Title } from '@mantine/core';
import { TemplateDefinition, WorkerTemplate } from '../../lib/templateTypes';
import WorkerConfig from '../../components/WorkerConfig';
import Link from 'next/link';

interface TemplateEditorProps {
    template: TemplateDefinition;
    setTemplate: (template: TemplateDefinition) => void;
}

const TemplateEditor = ({ template, setTemplate }: TemplateEditorProps) => {
    const handleWorkerChange = (workerDefinition: WorkerTemplate) => {
        setTemplate({ ...template, workerDefinition });
    };

    return (
        <Stack>
            <Title order={2}>Editing Template: {template.type}</Title>
            <Group>
                <Button component={Link} href="/templates">Back to Templates</Button>
            </Group>
            <WorkerConfig
                definition={template.workerDefinition}
                onChange={handleWorkerChange}
            />
        </Stack>
    );
};

export default TemplateEditor;
