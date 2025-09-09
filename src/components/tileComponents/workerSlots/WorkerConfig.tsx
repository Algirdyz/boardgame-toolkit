import { useState } from 'react';
import { WorkerTemplate } from '@shared/templates';
import { Stack, Title } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import LabelSlider from '@/components/simple/labelSlider';

interface WorkerConfigProps {
  definition: WorkerTemplate;
  onChange: (newDefinition: WorkerTemplate) => void;
}

const WorkerConfig = ({ definition, onChange }: WorkerConfigProps) => {
  const update = useDebouncedCallback((newDef: WorkerTemplate) => {
    onChange(newDef);
  }, 300);

  const [localDefinition, setLocalDefinition] = useState<WorkerTemplate>(definition);

  const handleFieldChange = (field: keyof WorkerTemplate, value: number | string) => {
    if (typeof value === 'number') {
      const newDef = { ...localDefinition, [field]: value };
      setLocalDefinition(newDef);
      update(newDef);
    }
  };

  return (
    <Stack gap="xs">
      <Title order={4}>Worker Configuration</Title>
      <LabelSlider
        label="Max Worker Slots"
        value={localDefinition.maxCount}
        onChange={(val) => handleFieldChange('maxCount', val)}
        min={1}
        max={10}
      />
      <LabelSlider
        label="Rows"
        value={localDefinition.rows}
        onChange={(val) => handleFieldChange('rows', val)}
        min={1}
        max={5}
      />
      <LabelSlider
        label="Spacing"
        value={localDefinition.spacing}
        onChange={(val) => handleFieldChange('spacing', val)}
        min={0}
      />
    </Stack>
  );
};

export default WorkerConfig;
