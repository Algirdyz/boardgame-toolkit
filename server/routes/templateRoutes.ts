import { FastifyInstance } from 'fastify';
import { getTemplates, getTemplate, saveTemplate, deleteTemplate, createTemplate } from '../lib/db';
import { TemplateDefinition } from '@shared/templates';

export default async function (fastify: FastifyInstance) {
  fastify.get('/api/templates', async (_request, reply) => {
    try {
      const templates = getTemplates();
      return templates;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Error reading templates' });
    }
  });

  fastify.get('/api/templates/:templateId', async (request, reply) => {
    try {
      const templateId = parseInt((request.params as { templateId: string }).templateId, 10);
      const template = getTemplate(templateId);

      if (template) {
        return {
          id: template.templateId,
          ...template.definition,
        }
      }
      return reply.status(404).send({ message: 'Template not found' });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Error reading template' });
    }
  });

  fastify.put('/api/templates', async (request, reply) => {
    try {
      const def = request.body as TemplateDefinition;
      if (!def.id) {
        def.id = createTemplate(def);
      } else {
        saveTemplate(def.id, def);
      }
      return def;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Error saving template' });
    }
  });

  fastify.delete('/api/templates/:templateId', async (request, reply) => {
    try {
      const params = request.params as { templateId: string };
      deleteTemplate(parseInt(params.templateId, 10));
      return { message: 'Template deleted successfully' };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Error deleting template' });
    }
  });
}
