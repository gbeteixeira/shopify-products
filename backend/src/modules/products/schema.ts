
import { z } from 'zod';
import { ProductStatus } from './product';
import dayjs from 'dayjs';

// Zod schema for variant
const VariantSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  title: z.string(),
  price: z.string(),
  sku: z.string().nullable(),
  position: z.number().nullable(),
  compare_at_price: z.string().nullable(),
  fulfillment_service: z.string().nullable(),
  inventory_management: z.string().nullable(),
  option1: z.string().nullable(),
  option2: z.string().nullable(),
  option3: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  taxable: z.boolean(),
  barcode: z.string().nullable(),
  grams: z.number(),
  image_id: z.number().nullable(),
  weight: z.number(),
  weight_unit: z.string(),
  requires_shipping: z.boolean(),
  price_currency: z.string(),
  compare_at_price_currency: z.string().nullable()
});

// Zod schema for image
const ImageSchema = z.object({
  id: z.number(),
  product_id: z.number(),
  position: z.number(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  alt: z.string().nullable(),
  width: z.number(),
  height: z.number(),
  src: z.string(),
  variant_ids: z.array(z.number())
});

// Zod schema for product
export const ProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  url: z.string().nullable().optional(),
  vendor: z.string(),
  product_type: z.string(),
  handle: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  published_at: z.coerce.date(),
  template_suffix: z.string().nullable(),
  published_scope: z.string(),
  tags: z.string(),
  variants: z.array(VariantSchema),
  images: z.array(ImageSchema),
  image: ImageSchema
});

export type Product = z.infer<typeof ProductSchema>;

// Function to calculate price range
export function calculatePriceRange(variants: Product['variants']) {
  const prices = variants.map(v => parseFloat(v.price));
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
}

// filters

export const ProductFilterSchema = z.object({
  text: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  createdAtStart: z.coerce.date().optional(),
  createdAtEnd: z.coerce.date().optional(),
  publishedAtStart: z.coerce.date().optional(),
  publishedAtEnd: z.coerce.date().optional(),
  updatedAtStart: z.coerce.date().optional(),
  updatedAtEnd: z.coerce.date().optional(),
})
.refine(
  (data) => {
    if (data.minPrice && data.maxPrice) {
      return data.minPrice <= data.maxPrice
    }

    return true;
  },
  {
    message: "O preço minimo não pode ser maior que o preço maximo",
    path: ["minPrice"],
  }
)
.refine(
  (data) => {
    if (data.createdAtStart && data.createdAtEnd) {
      const start = dayjs(data.createdAtStart)
      const end = dayjs(data.createdAtEnd)

      return start.isBefore(end) || start.isSame(end)
    }
    return true;
  },
  {
    message: "createdAtStart deve ser anterior a createdAtEnd",
    path: ["createdAtStart"],
  }
).refine(
  (data) => {
    if (data.publishedAtStart && data.publishedAtEnd) {
      const start = dayjs(data.publishedAtStart)
      const end = dayjs(data.publishedAtEnd)

      return start.isBefore(end) || start.isSame(end) 
    }
    return true;
  },
  {
    message: "publishedAtStart deve ser anterior a publishedAtEnd",
    path: ["publishedAtStart"],
  }
).refine(
  (data) => {
    if (data.updatedAtStart && data.updatedAtEnd) {
      const start = dayjs(data.updatedAtStart)
      const end = dayjs(data.updatedAtEnd)

      return start.isBefore(end) || start.isSame(end) 
    }
    return true;
  },
  {
    message: "updatedAtStart deve ser anterior a updatedAtEnd",
    path: ["updatedAtStart"],
  }
);


export type ProductFilter = z.infer<typeof ProductFilterSchema>;

export const ProductSortSchema = z.object({
  createdAt: z.enum(['asc', 'desc']).optional(),
  publishedAt: z.enum(['asc', 'desc']).optional(),
  minPrice: z.enum(['asc', 'desc']).optional(),
  maxPrice: z.enum(['asc', 'desc']).optional(),
})

export const ProductQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  sort: ProductSortSchema.optional(),
  filter: ProductFilterSchema.optional()
});

export type ProductQuery = z.infer<typeof ProductQuerySchema>;