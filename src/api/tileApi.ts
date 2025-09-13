import { ensureTileDefaults, TileDefinition } from '@shared/tiles';

export async function getTiles(): Promise<TileDefinition[]> {
  const response = await fetch('/api/tiles');
  if (!response.ok) throw new Error('Network response was not ok');
  const tiles = await response.json();
  return tiles.map(ensureTileDefaults);
}

export async function saveTile(tile: TileDefinition): Promise<TileDefinition> {
  const response = await fetch(`/api/tiles`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tile),
  });
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
}

export async function getTile(tileId: number): Promise<TileDefinition> {
  const response = await fetch(`/api/tiles/${tileId}`);
  if (response.status === 404) throw new Error('Tile not found');
  if (!response.ok) throw new Error('Network response was not ok');
  const tile = await response.json();
  return ensureTileDefaults(tile);
}

export async function deleteTile(tileId: number): Promise<void> {
  const response = await fetch(`/api/tiles/${tileId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Network response was not ok');
}
