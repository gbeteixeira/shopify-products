import { Collection, FilterQuery } from 'mongoose';
import { Product, ProductFilter, ProductQuery, calculatePriceRange } from './schema';
import ProductModel, { IProduct, ProductStatus } from './product';
import { NotFound } from '@/_errors/not-found-error';
import dayjs from 'dayjs';

export class ProductsRepository {
  async findAll(query: ProductQuery): Promise<{ products: IProduct[], total: number, numPages: number, hasMore: boolean }> {
    const { page, limit, sort, filter } = query;
    const skip = (page - 1) * limit;

    const filterQuery = this.buildFilterQuery(filter);

    const total = await ProductModel.countDocuments(filterQuery)

    // paginação
    const numPages = Math.ceil(total / limit);
    const hasMore = numPages > page
 
    const products = await ProductModel.find(filterQuery).sort(sort).skip(skip).limit(limit)

    return { 
      products, 
      total,
      numPages,
      hasMore
    };
  }

  private buildFilterQuery(filter?: ProductFilter): FilterQuery<IProduct> {
    const query: FilterQuery<IProduct> = {};

    // Filtro por texto (busca no nome e descrição)
    if (filter?.text) {
      query['$text'] = { $search: filter.text };
    }

    // Filtro por preço (minPrice e maxPrice)
    if (filter?.minPrice !== undefined || filter?.maxPrice !== undefined) {

      if (filter.minPrice !== undefined) {
        query['price_range.min'] = {};
        query['price_range.min'] = { $gte: filter.minPrice }
      }

      if (filter.maxPrice !== undefined) {
        query['price_range.max'] = {};
        query['price_range.max'] = { $lte: filter.maxPrice }
      }
    }

    // Filtro por status
    if (filter?.status) {
      query.status = filter.status;
    } else {
      query.status = ProductStatus.PUBLISHED
    }

    // Filtro por data de criação (createdAt)
    if (filter?.createdAtStart || filter?.createdAtEnd) {
      query.created_at = {};
      if (filter.createdAtStart) query.created_at.$gte = filter.createdAtStart;
      if (filter.createdAtEnd) query.created_at.$lte = filter.createdAtEnd;
    }

    // Filtro por data de publicação (publishedAt)
    if (filter?.publishedAtStart || filter?.publishedAtEnd) {
      query.published_at = {};
      if (filter.publishedAtStart) query.published_at.$gte = filter.publishedAtStart;
      if (filter.publishedAtEnd) query.published_at.$lte = filter.publishedAtEnd;
    }

    // Filtro por data de atualização (updatedAt)
    if (filter?.updatedAtStart || filter?.updatedAtEnd) {
      query.updated_at = {};
      if (filter.updatedAtStart) query.updated_at.$gte = filter.updatedAtStart;
      if (filter.updatedAtEnd) query.updated_at.$lte = filter.updatedAtEnd;
    }

    return query;
  }

  async findById(id: number): Promise<IProduct | null> {
    return ProductModel.findOne({ id });
  }

  async createOrUpdate(productData: Product): Promise<IProduct> {
    const { id } = productData;

    const existingProduct = await this.findById(id);

    if (existingProduct) {
      
      // Para evitar ter que atualizar o produto todo dia
      // verifico se houve alguma alteração recente
      if(dayjs(existingProduct?.updated_at).isBefore(dayjs(productData.updated_at))) return existingProduct

      Object.assign(
        existingProduct,
        {
          ...productData,
          price_range: calculatePriceRange(productData.variants)
        }
      );

      return existingProduct.save();
    } else {
      return ProductModel.create({
        ...productData,
        price_range: calculatePriceRange(productData.variants),
      });
    }
  }

  async updateStatus(url: string, status: ProductStatus): Promise<IProduct> {
    const product = await ProductModel.findOne({ url });

    if (!product) { throw new NotFound() }

    product.status = status

    return product.save();
  }
}