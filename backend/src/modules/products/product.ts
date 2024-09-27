import mongoose, { Document, Schema } from 'mongoose';
import { Product } from './schema';

export enum ProductStatus {
  PUBLISHED = 'PUBLISHED',
  DELETED = 'DELETED'
}

// Mongoose schema
const productMongooseSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  url: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  vendor: { type: String, required: true },
  product_type: { type: String },
  status: {
    type: String,
    enum: Object.values(ProductStatus), 
    default: ProductStatus.PUBLISHED, 
  },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true },
  published_at: { type: Date, required: true },
  template_suffix: { type: String },
  tags: { type: String },
  variants: [{
    id: { type: Number, required: true },
    product_id: { type: Number, required: true },
    title: { type: String, required: true },
    price: { type: String, required: true },
    compare_at_price: { type: String },
    created_at: { type: Date, required: true },
    updated_at: { type: Date, required: true },
    image_id: { type: Number },
    price_currency: { type: String, required: true },
    compare_at_price_currency: { type: String }
  }],
  images: [{
    id: { type: Number, required: true },
    product_id: { type: Number, required: true },
    position: { type: Number, required: true },
    created_at: { type: Date, required: true },
    updated_at: { type: Date, required: true },
    alt: { type: String },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    src: { type: String, required: true },
    variant_ids: [{ type: Number }]
  }],
  image: {
    id: { type: Number, required: true },
    product_id: { type: Number, required: true },
    position: { type: Number, required: true },
    created_at: { type: Date, required: true },
    updated_at: { type: Date, required: true },
    alt: { type: String },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    src: { type: String, required: true },
    variant_ids: [{ type: Number }]
  },
  price_range: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  }
});

productMongooseSchema.index({ 
  vendor: 'text', 
  tags: 'text',
  title: 'text',
});

export interface IProduct extends Document, Product {
  id: number;
  status: ProductStatus;
  price_range: {
    min: number;
    max: number;
  };
}

export default mongoose.model<IProduct>('Product', productMongooseSchema);