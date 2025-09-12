import { Variable, Variables, VariableType } from '@shared/variables';
import { db } from './database';

export function getDbVariables(): Variables {
  const stmt = db.prepare('SELECT * FROM global_variables');
  const rows = stmt.all() as any[];

  const result: Variables = {
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
          unit: row.unit || 'px',
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

export function saveDbVariable(type: VariableType, variable: Variable): number {
  const baseData = {
    name: variable.name,
    description: variable.description,
  };

  let value: string;
  let unit: string | null = null;

  switch (type) {
    case 'colors':
      value = (variable as any).value;
      break;
    case 'shapes':
      value = JSON.stringify({
        type: (variable as any).type,
        value: (variable as any).value,
      });
      break;
    case 'dimensions':
      value = (variable as any).value.toString();
      unit = (variable as any).unit;
      break;
    case 'names':
      value = (variable as any).value;
      break;
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

export function deleteDbVariable(id: number) {
  const stmt = db.prepare('DELETE FROM global_variables WHERE id = ?');
  stmt.run(id);
}
