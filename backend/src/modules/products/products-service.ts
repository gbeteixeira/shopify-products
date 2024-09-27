import { ProductsRepository } from './products-repository';
import { IProduct, ProductStatus } from './product';
import { Logger } from '@/utils/logger';
import { fetchShopifyProduct, readUrlsFromFile, retryWithExponentialBackoff } from '@/utils/api-utils';
import cron from 'node-cron';
import { ProductQuery } from './schema';
import { z } from 'zod';

export class ProductsService {
  private readonly logger: Logger = new Logger(ProductsService.name);
  private repository: ProductsRepository;

  constructor() {
    this.repository = new ProductsRepository();
    this.logger.debug(`[OK] - ${ProductsService.name}`)
  }

  async findAll(query: ProductQuery): Promise<{ products: IProduct[], total: number, numPages: number, hasMore: boolean }> {
    return this.repository.findAll(query);
  }

  async updateProductFromShopify(shopifyUrl: string): Promise<IProduct | false> {

    try {
      const shopifyData = await retryWithExponentialBackoff(() => fetchShopifyProduct(shopifyUrl));

      if(!shopifyData.success) {
        // atualiza o status para
        return this.repository.updateStatus(shopifyUrl, ProductStatus.DELETED);
      }

      return this.repository.createOrUpdate({
        ...shopifyData.data,
        url: shopifyUrl
      });
    } catch (error) {
      return this.repository.updateStatus(shopifyUrl, ProductStatus.DELETED);
    }   
  }

  async updateAllProductsFromFile(): Promise<void> {
    const urls = await readUrlsFromFile();
    for (const url of urls) {
      try {
        await this.updateProductFromShopify(url);
        this.logger.log(`Produto atualizado: ${url}`);
      } catch (error) {
        if (error instanceof z.ZodError) {
          this.logger.error(`Falha na validação dos dados do Shopify (${url}): ${(error as Error).message}`);
        } else {
          this.logger.error(`Erro ao buscar dados do Shopify (${url}): ${(error as Error).message}`);
        }
      }
    }
  }

  schedule(): void {
    cron.schedule('0 0 * * *', async () => {

      this.logger.debug(`[SCHEDULE] - Iniciando atualização diária dos produtos...`)

      await this.updateAllProductsFromFile();

      this.logger.debug(`[SCHEDULE] - Atualização diária dos produtos concluíd..`)
    });
  }

}