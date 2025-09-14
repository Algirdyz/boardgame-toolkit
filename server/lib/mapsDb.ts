import { MapDefinition } from '@shared/maps';
import { db } from './database';

export function getMaps(): MapDefinition[] {
  const stmt = db.prepare('SELECT * FROM maps');
  return stmt.all().map((row: any) => ({
    id: row.mapId,
    ...JSON.parse(row.definition),
  }));
}

export function getMap(mapId: number): MapDefinition | null {
  const stmt = db.prepare('SELECT * FROM maps WHERE mapId = ?');
  const row = stmt.get(mapId) as { mapId: number; definition: string };
  if (row) {
    return {
      id: row.mapId,
      ...JSON.parse(row.definition),
    };
  }
  return null;
}

export function saveMap(mapId: number, definition: Omit<MapDefinition, 'id'>) {
  const stmt = db.prepare('INSERT OR REPLACE INTO maps (mapId, definition) VALUES (?, ?)');
  stmt.run(mapId, JSON.stringify(definition));
}

export function createMap(definition: MapDefinition): number {
  const stmt = db.prepare('INSERT INTO maps (definition) VALUES (?)');
  const info = stmt.run(JSON.stringify(definition));
  return info.lastInsertRowid as number;
}

export function deleteMap(mapId: number) {
  const stmt = db.prepare('DELETE FROM maps WHERE mapId = ?');
  stmt.run(mapId);
}
