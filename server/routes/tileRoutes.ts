import { TileDefinition } from '@shared/tiles';
import { FastifyInstance } from 'fastify';
import { createTile, deleteTile, getTile, getTiles, saveTile } from '../lib/tilesDb';

export default async function (fastify: FastifyInstance) {
  fastify.get('/api/tiles', async (_request, reply) => {
    try {
      const tiles = getTiles();
      return tiles;
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Error reading tiles' });
    }
  });

  fastify.get('/api/tiles/:tileId', async (request, reply) => {
    try {
      const tileId = parseInt((request.params as { tileId: string }).tileId, 10);
      const tile = getTile(tileId);

      if (tile) {
        return {
          id: tile.tileId,
          ...tile.definition,
        };
      }
      return reply.status(404).send({ message: 'Tile not found' });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Error reading tile' });
    }
  });

  fastify.put('/api/tiles', async (request, reply) => {
    try {
      const tileData = request.body as TileDefinition;
      let tileId: number;

      if (tileData.id) {
        // Update existing tile
        tileId = tileData.id;
        const { id, ...definition } = tileData;
        saveTile(tileId, definition);
      } else {
        // Create new tile
        const { id, ...definition } = tileData;
        tileId = createTile(definition as TileDefinition);
      }

      return {
        id: tileId,
        ...tileData,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Error saving tile' });
    }
  });

  fastify.delete('/api/tiles/:tileId', async (request, reply) => {
    try {
      const tileId = parseInt((request.params as { tileId: string }).tileId, 10);
      deleteTile(tileId);
      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({ message: 'Error deleting tile' });
    }
  });
}
