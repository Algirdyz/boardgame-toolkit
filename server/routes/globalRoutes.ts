import { GlobalVariable, GlobalVariableType } from '@shared/globals';
import { FastifyInstance } from 'fastify';
import { deleteGlobalVariable, getGlobalVariables, saveGlobalVariable } from '../lib/db';

export default async function (fastify: FastifyInstance) {
  // Get all global variables
  fastify.get('/api/globals', async (_request, reply) => {
    try {
      const globals = getGlobalVariables();
      return globals;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Error reading global variables' });
    }
  });

  // Save or update a global variable
  fastify.put('/api/globals/:type', async (request, reply) => {
    try {
      const { type } = request.params as { type: GlobalVariableType };
      const variable = request.body as GlobalVariable;

      const id = saveGlobalVariable(type, variable);
      return { ...variable, id };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Error saving global variable' });
    }
  });

  // Delete a global variable
  fastify.delete('/api/globals/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      deleteGlobalVariable(parseInt(id, 10));
      return { message: 'Global variable deleted successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Error deleting global variable' });
    }
  });
}
