import Fastify from 'fastify';
import { componentRoutes } from './routes/componentRoutes';
import globalRoutes from './routes/globalRoutes';
import templateRoutes from './routes/templateRoutes';

const fastify = Fastify({
  logger: true,
});

fastify.register(templateRoutes);
fastify.register(globalRoutes);
fastify.register(componentRoutes);

const start = async () => {
  try {
    await fastify.listen({ port: 3001 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
