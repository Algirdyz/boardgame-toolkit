import { MapDefinition } from '@shared/maps';

export async function getMaps(): Promise<MapDefinition[]> {
  const response = await fetch('/api/maps');
  if (!response.ok) throw new Error('Network response was not ok');
  const maps = await response.json();
  return maps;
}

export async function saveMap(map: MapDefinition): Promise<MapDefinition> {
  const response = await fetch(`/api/maps`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(map),
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
}

export async function getMap(mapId: number): Promise<MapDefinition> {
  const response = await fetch(`/api/maps/${mapId}`);
  if (response.status === 404) throw new Error('Map not found');
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
}

export async function deleteMap(mapId: number): Promise<void> {
  const response = await fetch(`/api/maps/${mapId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Network response was not ok');
}
