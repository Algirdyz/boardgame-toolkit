import Fastify from 'fastify';
import { componentRoutes } from './routes/componentRoutes';
import templateRoutes from './routes/templateRoutes';
import variableRoutes from './routes/variableRoutes';

const fastify = Fastify({
  logger: true,
});

fastify.register(templateRoutes);
fastify.register(variableRoutes);
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
