import { Stack } from '@mantine/core';
import WorkerConfig from '../../../components/WorkerConfig';
import { TemplateDefinition, WorkerTemplate } from '../../../components/lib/templateTypes';

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
            <WorkerConfig
                definition={template.workerDefinition}
                onChange={handleWorkerChange}
            />
        </Stack>
    );
};

export default TemplateEditor;
