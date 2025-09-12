import { TemplateDefinition } from '@shared/templates';
import { TextInput } from '@mantine/core';

interface TemplateBasicInfoProps {
  template: TemplateDefinition;
  onTemplateChange: (template: TemplateDefinition) => void;
}

export function TemplateBasicInfo({ template, onTemplateChange }: TemplateBasicInfoProps) {
  return (
    <TextInput
      label="Template Name"
      value={template.name}
      onChange={(e) =>
        onTemplateChange({
          ...template,
          name: e.target.value,
        })
      }
    />
  );
}
