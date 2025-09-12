import { TemplateDefinition } from '@shared/templates';

export async function getTemplates(): Promise<TemplateDefinition[]> {
  const response = await fetch('/api/templates');
  if (!response.ok) throw new Error('Network response was not ok');
  const templates = await response.json();
  return templates;
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
  return response.json();
}

export async function deleteTemplate(templateId: number): Promise<void> {
  const response = await fetch(`/api/templates/${templateId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Network response was not ok');
}
