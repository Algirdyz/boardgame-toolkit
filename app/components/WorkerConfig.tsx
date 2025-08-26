import { NumberInput, Stack, Title } from '@mantine/core';
import { WorkerTemplate } from '../lib/templateTypes';

interface WorkerConfigProps {
    definition: WorkerTemplate;
    onChange: (newDefinition: WorkerTemplate) => void;
}

const WorkerConfig = ({ definition, onChange }: WorkerConfigProps) => {
    const handleFieldChange = (field: keyof WorkerTemplate, value: number | string) => {
        if (typeof value === 'number') {
            onChange({ ...definition, [field]: value });
        }
    };

    return (
        <Stack>
            <Title order={3}>Worker Configuration</Title>
            <NumberInput
                label="Max Worker Slots"
                value={definition.maxCount}
                onChange={(val) => handleFieldChange('maxCount', val)}
                min={0}
                max={10}
            />
            <NumberInput
                label="Rows"
                value={definition.rows}
                onChange={(val) => handleFieldChange('rows', val)}
                min={1}
            />
            <NumberInput
                label="Spacing"
                value={definition.spacing}
                onChange={(val) => handleFieldChange('spacing', val)}
                min={0}
            />
        </Stack>
    );
};

export default WorkerConfig;
