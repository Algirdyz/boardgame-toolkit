import { ComponentStaticSpecs } from '@shared/components';

export async function getComponents(): Promise<ComponentStaticSpecs[]> {
  const response = await fetch('/api/components');
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
}

export async function saveComponent(
  component: ComponentStaticSpecs
): Promise<ComponentStaticSpecs> {
  const response = await fetch('/api/components', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(component),
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
}

export async function getComponent(componentId: number): Promise<ComponentStaticSpecs> {
  const response = await fetch(`/api/components/${componentId}`);
  if (response.status === 404) throw new Error('Component not found');
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
}

export async function deleteComponent(componentId: number): Promise<void> {
  const response = await fetch(`/api/components/${componentId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Network response was not ok');
}
