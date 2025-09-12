import path from 'path';
import { ComponentStaticSpecs } from '@shared/components';
import { GlobalVariable, GlobalVariables, GlobalVariableType } from '@shared/globals';
import { TemplateDefinition } from '@shared/templates';
import Database from 'better-sqlite3';

const db = new Database(path.join(process.cwd(), 'server/data/boardgame-toolkit.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS templates (
    templateId INTEGER PRIMARY KEY AUTOINCREMENT,
    definition TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS global_variables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    value TEXT NOT NULL,
    unit TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    definition TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
  const stmt = db.prepare(
    'INSERT OR REPLACE INTO templates (templateId, definition) VALUES (?, ?)'
  );
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

// Global Variables Functions
export function getGlobalVariables(): GlobalVariables {
  const stmt = db.prepare('SELECT * FROM global_variables');
  const rows = stmt.all() as any[];

  const result: GlobalVariables = {
    colors: [],
    shapes: [],
    dimensions: [],
    names: [],
  };

  rows.forEach((row) => {
    const baseItem = {
      id: row.id,
      name: row.name,
      description: row.description,
    };

    switch (row.type) {
      case 'colors':
        result.colors.push({
          ...baseItem,
          value: row.value,
        });
        break;
      case 'shapes':
        result.shapes.push({
          ...baseItem,
          type: JSON.parse(row.value).type,
          value: JSON.parse(row.value).value,
        });
        break;
      case 'dimensions':
        result.dimensions.push({
          ...baseItem,
          value: parseFloat(row.value),
          unit: row.unit,
        });
        break;
      case 'names':
        result.names.push({
          ...baseItem,
          value: row.value,
        });
        break;
    }
  });

  return result;
}

export function saveGlobalVariable(type: GlobalVariableType, variable: GlobalVariable): number {
  const baseData = {
    name: variable.name,
    description: variable.description || null,
  };

  let value: string;
  let unit: string | null = null;

  switch (type) {
    case 'colors': {
      value = (variable as any).value;
      break;
    }
    case 'shapes': {
      const shape = variable as any;
      value = JSON.stringify({ type: shape.type, value: shape.value });
      break;
    }
    case 'dimensions': {
      const dim = variable as any;
      value = dim.value.toString();
      unit = dim.unit;
      break;
    }
    case 'names': {
      value = (variable as any).value;
      break;
    }
    default:
      throw new Error(`Unknown variable type: ${type}`);
  }

  if (variable.id) {
    // Update existing
    const stmt = db.prepare(`
      UPDATE global_variables 
      SET name = ?, value = ?, unit = ?, description = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(baseData.name, value, unit, baseData.description, variable.id);
    return variable.id;
  }

  // Create new
  const stmt = db.prepare(`
    INSERT INTO global_variables (type, name, value, unit, description)
    VALUES (?, ?, ?, ?, ?)
  `);
  const info = stmt.run(type, baseData.name, value, unit, baseData.description);
  return info.lastInsertRowid as number;
}

export function deleteGlobalVariable(id: number) {
  const stmt = db.prepare('DELETE FROM global_variables WHERE id = ?');
  stmt.run(id);
}

// Component Functions
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
