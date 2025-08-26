import { TileSet } from './types';

export const saveTileSet = async (tileSet: TileSet): Promise<void> => {
  try {
    const response = await fetch('/api/tilesets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tileSet),
    });

    if (!response.ok) {
      throw new Error('Failed to save tile set');
    }

  } catch (error) {
    console.error('Failed to save tile set:', error);
  }
};

export const loadTileSet = async (id: string): Promise<TileSet | null> => {
  try {
    const response = await fetch(`/api/tilesets?id=${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        alert('No saved data found for this TileSet.');
        return null;
      }
      throw new Error('Failed to load tile set');
    }

    const tileSet: TileSet = await response.json();
    return tileSet;
  } catch (error) {
    console.error('Failed to load tile set:', error);
    return null;
  }
};
