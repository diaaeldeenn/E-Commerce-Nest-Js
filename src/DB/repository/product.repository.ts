import type { Model } from 'mongoose';
import BaseRepository from './base.repository.js';
import { Brand } from '../models/brand.model.js';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Product } from '../models/product.model.js';

@Injectable()
class ProductRepository extends BaseRepository<Product> {
  constructor(@InjectModel(Product.name) protected model: Model<Product>) {
    super(model);
  }
}

export default ProductRepository;
