import { MapDefinition } from '@shared/maps';
import { FastifyInstance } from 'fastify';
import { createMap, deleteMap, getMap, getMaps, saveMap } from '../lib/mapsDb';

export default async function (fastify: FastifyInstance) {
  fastify.get('/api/maps', async (_request, reply) => {
    try {
      const maps = getMaps();
      return maps;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Error reading maps' });
    }
  });

  fastify.get('/api/maps/:mapId', async (request, reply) => {
    try {
      const mapId = parseInt((request.params as { mapId: string }).mapId, 10);
      const map = getMap(mapId);

      if (map) {
        return map;
      }
      return reply.status(404).send({ message: 'Map not found' });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Error reading map' });
    }
  });

  fastify.put('/api/maps', async (request, reply) => {
    try {
      const mapData = request.body as MapDefinition;
      let mapId: number;

      if (mapData.id) {
        // Update existing map
        mapId = mapData.id;
        const { id, ...definition } = mapData;
        saveMap(mapId, definition);
      } else {
        // Create new map
        const { id, ...definition } = mapData;
        mapId = createMap(definition as MapDefinition);
      }

      return {
        id: mapId,
        ...mapData,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Error saving map' });
    }
  });

  fastify.delete('/api/maps/:mapId', async (request, reply) => {
    try {
      const mapId = parseInt((request.params as { mapId: string }).mapId, 10);
      deleteMap(mapId);
      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Error deleting map' });
    }
  });
}
