import { TemplateDefinition } from '@shared/templates';

// Helper function to ensure template has proper defaults for enabled flags
function ensureTemplateDefaults(template: TemplateDefinition): TemplateDefinition {
  return {
    ...template,
    workerDefinition: {
      ...template.workerDefinition,
      enabled: template.workerDefinition.enabled ?? true,
    },
    nameDefinition: {
      ...template.nameDefinition,
      enabled: template.nameDefinition.enabled ?? true,
    },
    resourceListDefinition: {
      ...template.resourceListDefinition,
      enabled: template.resourceListDefinition.enabled ?? true,
    },
  };
}

export async function getTemplates(): Promise<TemplateDefinition[]> {
  const response = await fetch('/api/templates');
  if (!response.ok) throw new Error('Network response was not ok');
  const templates = await response.json();
  return templates.map(ensureTemplateDefaults);
}

export async function saveTemplate(template: TemplateDefinition): Promise<TemplateDefinition> {
  const response = await fetch(`/api/templates`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(template),
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
}

export async function getTemplate(templateId: number): Promise<TemplateDefinition> {
  const response = await fetch(`/api/templates/${templateId}`);
  if (response.status === 404) throw new Error('Template not found');
  if (!response.ok) throw new Error('Network response was not ok');
  const template = await response.json();
  return ensureTemplateDefaults(template);
}
