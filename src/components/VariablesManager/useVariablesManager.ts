import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { Variable, VariableType } from '@shared/variables';
import { deleteVariable, getVariables, saveVariable } from '../../api/variablesApi';

export function useVariablesManager() {
  const queryClient = useQueryClient();

  // Query for fetching variables
  const variables = useQuery({
    queryKey: ['variables'],
    queryFn: getVariables,
  });

  // Mutation for saving variables
  const saveMutation = useMutation({
    mutationFn: ({ type, variable }: { type: VariableType; variable: Variable }) =>
      saveVariable(type, variable),
    onSuccess: (_, { variable: savedVariable }) => {
      queryClient.invalidateQueries({ queryKey: ['variables'] });
      notifications.show({
        title: 'Success',
        message: `Variable "${savedVariable.name}" ${savedVariable.id ? 'updated' : 'created'} successfully`,
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to save variable',
        color: 'red',
      });
    },
  });

  // Mutation for deleting variables
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteVariable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['variables'] });
      notifications.show({
        title: 'Success',
        message: 'Variable deleted successfully',
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Error',
        message: 'Failed to delete variable',
        color: 'red',
      });
    },
  });

  return {
    variables,
    saveMutation,
    deleteMutation,
  };
}
