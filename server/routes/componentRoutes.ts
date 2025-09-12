import { FastifyInstance } from 'fastify';
import { ComponentStaticSpecs } from '../../shared/components';
import {
  deleteComponent as dbDeleteComponent,
  getComponent as dbGetComponent,
  getComponents as dbGetComponents,
  saveComponent as dbSaveComponent,
} from '../lib/db';

export async function componentRoutes(fastify: FastifyInstance) {
  // Get all components
  fastify.get('/api/components', async (_request, reply) => {
    try {
      const components = await dbGetComponents();
      reply.send(components);
    } catch (error) {
      console.error('Error fetching components:', error);
      reply.status(500).send({ error: 'Failed to fetch components' });
    }
  });

  // Get single component
  fastify.get<{ Params: { id: string } }>('/api/components/:id', async (request, reply) => {
    try {
      const componentId = parseInt(request.params.id, 10);
      if (isNaN(componentId)) {
        reply.status(400).send({ error: 'Invalid component ID' });
        return;
      }

      const component = await dbGetComponent(componentId);
      if (!component) {
        reply.status(404).send({ error: 'Component not found' });
        return;
      }

      reply.send(component);
    } catch (error) {
      console.error('Error fetching component:', error);
      reply.status(500).send({ error: 'Failed to fetch component' });
    }
  });

  // Save component (create or update)
  fastify.put<{ Body: ComponentStaticSpecs }>('/api/components', async (request, reply) => {
    try {
      const component = request.body;

      // Validate required fields
      if (!component.name) {
        reply.status(400).send({ error: 'Component name is required' });
        return;
      }

      const savedComponent = await dbSaveComponent(component);
      reply.send(savedComponent);
    } catch (error) {
      console.error('Error saving component:', error);
      reply.status(500).send({ error: 'Failed to save component' });
    }
  });

  // Delete component
  fastify.delete<{ Params: { id: string } }>('/api/components/:id', async (request, reply) => {
    try {
      const componentId = parseInt(request.params.id, 10);
      if (isNaN(componentId)) {
        reply.status(400).send({ error: 'Invalid component ID' });
        return;
      }

      await dbDeleteComponent(componentId);
      reply.send({ success: true });
    } catch (error) {
      console.error('Error deleting component:', error);
      reply.status(500).send({ error: 'Failed to delete component' });
    }
  });
}
