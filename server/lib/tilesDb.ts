import { TileDefinition } from '@shared/tiles';
import { db } from './database';

export function getTiles(): TileDefinition[] {
  const stmt = db.prepare('SELECT * FROM tiles');
  return stmt.all().map((row: any) => ({
    id: row.tileId,
    ...JSON.parse(row.definition),
  }));
}

export function getTile(tileId: number) {
  const stmt = db.prepare('SELECT * FROM tiles WHERE tileId = ?');
  const row = stmt.get(tileId) as { tileId: number; definition: string };
  if (row) {
    return {
      tileId: row.tileId,
      definition: JSON.parse(row.definition),
    };
  }
  return null;
}

export function saveTile(tileId: number, definition: any) {
  const stmt = db.prepare('INSERT OR REPLACE INTO tiles (tileId, definition) VALUES (?, ?)');
  stmt.run(tileId, JSON.stringify(definition));
}

export function createTile(definition: TileDefinition): number {
  const stmt = db.prepare('INSERT INTO tiles (definition) VALUES (?)');
  const info = stmt.run(JSON.stringify(definition));
  return info.lastInsertRowid as number;
}

export function deleteTile(tileId: number) {
  const stmt = db.prepare('DELETE FROM tiles WHERE tileId = ?');
  stmt.run(tileId);
}
