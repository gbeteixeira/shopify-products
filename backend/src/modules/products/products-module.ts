import { FastifyInstance } from 'fastify';
import { ProductsController } from './products-controller';

export default async function (fastify: FastifyInstance): Promise<void> {
  const controller = new ProductsController();

  fastify.get('/products', controller.getAllProducts.bind(controller));
  fastify.get('/products/update-all', controller.updateAllProducts.bind(controller));
}
