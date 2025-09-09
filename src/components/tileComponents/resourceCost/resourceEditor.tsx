import { ResourceListTemplate } from '@shared/templates';
import { NumberInput, Stack, Title } from '@mantine/core';

interface ResourceConfigProps {
  definition: ResourceListTemplate;
  onChange: (newDefinition: ResourceListTemplate) => void;
}

export default function ResourceEditor({ definition, onChange }: ResourceConfigProps) {
  const handleFieldChange = (field: keyof ResourceListTemplate, value: number | string) => {
    if (typeof value === 'number') {
      onChange({ ...definition, [field]: value });
    }
  };

  return (
    <Stack gap="xs">
      <Title order={4}>Worker Configuration</Title>
      <NumberInput
        label="Spacing"
        value={definition.spacing}
        onChange={(val) => handleFieldChange('spacing', val)}
        min={0}
      />
    </Stack>
  );
}
