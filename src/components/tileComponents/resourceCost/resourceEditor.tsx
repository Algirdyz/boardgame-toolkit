import { useState } from 'react';
import { ResourceListTemplate } from '@shared/templates';
import { NumberInput } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { ComponentRow } from '../Component';

interface ResourceConfigProps {
  definition: ResourceListTemplate;
  onChange: (newDefinition: ResourceListTemplate) => void;
}

export default function ResourceEditor({ definition, onChange }: ResourceConfigProps) {
  const update = useDebouncedCallback((newDef: ResourceListTemplate) => {
    onChange(newDef);
  }, 300);

  const [localDefinition, setLocalDefinition] = useState<ResourceListTemplate>(definition);

  const handleFieldChange = (field: keyof ResourceListTemplate, value: number | string) => {
    if (typeof value === 'number') {
      const newDef = { ...localDefinition, [field]: value };
      setLocalDefinition(newDef);
      update(newDef);
    }
  };

  return (
    <ComponentRow
      name="Resource List"
      expanded={definition.enabled}
      onToggle={(enabled) => onChange({ ...definition, enabled })}
    >
      <NumberInput
        label="Spacing"
        value={definition.spacing}
        onChange={(val) => handleFieldChange('spacing', val)}
        min={0}
      />
    </ComponentRow>
  );
}
