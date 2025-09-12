import { Variable, VariableType } from '@shared/variables';
import { FastifyInstance } from 'fastify';
import { deleteDbVariable, getDbVariables, saveDbVariable } from '../lib/variablesDb';

export default async function (fastify: FastifyInstance) {
  // Get all variables
  fastify.get('/api/variables', async (_request, reply) => {
    try {
      const variables = getDbVariables();
      return variables;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Error reading variables' });
    }
  });

  // Save or update a variable
  fastify.put('/api/variables/:type', async (request, reply) => {
    try {
      const { type } = request.params as { type: VariableType };
      const variable = request.body as Variable;

      const id = saveDbVariable(type, variable);
      return { ...variable, id };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Error saving variable' });
    }
  });

  // Delete a variable
  fastify.delete('/api/variables/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      deleteDbVariable(parseInt(id, 10));
      return { message: 'Variable deleted successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Error deleting variable' });
    }
  });
}
