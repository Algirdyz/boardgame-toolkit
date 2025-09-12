import { ComponentStaticSpecs } from '@shared/components';
import { db } from './database';

export function getComponents(): ComponentStaticSpecs[] {
  const stmt = db.prepare('SELECT * FROM components');
  return stmt.all().map((row: any) => ({
    id: row.id,
    ...JSON.parse(row.definition),
  }));
}

export function getComponent(componentId: number): ComponentStaticSpecs | null {
  const stmt = db.prepare('SELECT * FROM components WHERE id = ?');
  const row = stmt.get(componentId) as { id: number; definition: string } | undefined;
  if (row) {
    return {
      id: row.id,
      ...JSON.parse(row.definition),
    };
  }
  return null;
}

export function saveComponent(component: ComponentStaticSpecs): ComponentStaticSpecs {
  if (component.id) {
    // Update existing
    const stmt = db.prepare(`
      UPDATE components 
      SET definition = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(JSON.stringify(component), component.id);
    return component;
  }

  // Create new
  const stmt = db.prepare(`
    INSERT INTO components (definition)
    VALUES (?)
  `);
  const info = stmt.run(JSON.stringify(component));
  return {
    ...component,
    id: info.lastInsertRowid as number,
  };
}

export function deleteComponent(componentId: number) {
  const stmt = db.prepare('DELETE FROM components WHERE id = ?');
  stmt.run(componentId);
}
