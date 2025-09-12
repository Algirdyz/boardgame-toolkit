import { Variable, Variables, VariableType } from '@shared/variables';

export async function getVariables(): Promise<Variables> {
  const response = await fetch('/api/variables');
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
}

export async function saveVariable(type: VariableType, variable: Variable): Promise<Variable> {
  const response = await fetch(`/api/variables/${type}`, {
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

export async function deleteVariable(id: number): Promise<void> {
  const response = await fetch(`/api/variables/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
}
