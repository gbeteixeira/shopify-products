import { FastifyRequest, FastifyReply } from 'fastify';
import { ProductsService } from './products-service';
import { ProductQuerySchema } from './schema';
import transformQuery from '@/utils/transform-query';

export class ProductsController {

  constructor(
    private service: ProductsService = new ProductsService()
  ) {
    service.schedule() // Inicia o agendamento de atualizações diárias
  }

  async getAllProducts(request: FastifyRequest, reply: FastifyReply) {
    try {

      const query = ProductQuerySchema.parse({
        ...request.query as any,
        ...transformQuery(new URLSearchParams(request.query as any)),
      });

      const { products, total, numPages, hasMore } = await this.service.findAll(query);
      
      reply.send({
        page: query.page,
        limit: query.limit,
        total,
        numPages,
        hasMore,
        data: products,
      });
    } catch (error) {
      throw error
    }
  }

  async updateAllProducts(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await this.service.updateAllProductsFromFile();
    reply.send({ message: 'Todos os produtos foram atualizados.' });
  }
}