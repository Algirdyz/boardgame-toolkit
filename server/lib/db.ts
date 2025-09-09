import { TemplateDefinition } from '@shared/templates';
import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'server/data/boardgame-toolkit.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS templates (
    templateId INTEGER PRIMARY KEY AUTOINCREMENT,
    definition TEXT
  )
`);


export function getTemplates(): TemplateDefinition[] {
  const stmt = db.prepare('SELECT * FROM templates');
  return stmt.all().map((row: any) => ({
    id: row.templateId,
    ...JSON.parse(row.definition),
  }));
}

export function getTemplate(templateId: number) {
  const stmt = db.prepare('SELECT * FROM templates WHERE templateId = ?');
  const row = stmt.get(templateId) as { templateId: number; definition: string };
  if (row) {
    return {
      templateId: row.templateId,
      definition: JSON.parse(row.definition),
    };
  }
  return null;
}

export function saveTemplate(templateId: number, definition: any) {
  const stmt = db.prepare('INSERT OR REPLACE INTO templates (templateId, definition) VALUES (?, ?)');
  stmt.run(templateId, JSON.stringify(definition));
}

export function createTemplate(definition: TemplateDefinition): number {
  const stmt = db.prepare('INSERT INTO templates (definition) VALUES (?)');
  const info = stmt.run(JSON.stringify(definition));
  return info.lastInsertRowid as number;
}

export function deleteTemplate(templateId: number) {
  const stmt = db.prepare('DELETE FROM templates WHERE templateId = ?');
  stmt.run(templateId);
}

