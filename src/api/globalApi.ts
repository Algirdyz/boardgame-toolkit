import { GlobalVariable, GlobalVariables, GlobalVariableType } from '@shared/globals';

export async function getGlobalVariables(): Promise<GlobalVariables> {
  const response = await fetch('/api/globals');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

export async function saveGlobalVariable(
  type: GlobalVariableType,
  variable: GlobalVariable
): Promise<GlobalVariable> {
  const response = await fetch(`/api/globals/${type}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(variable),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
}

export async function deleteGlobalVariable(id: number): Promise<void> {
  const response = await fetch(`/api/globals/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
}
