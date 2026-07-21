import type { Model } from 'mongoose';
import BaseRepository from './base.repository.js';
import { Brand } from '../models/brand.model.js';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
class BrandRepository extends BaseRepository<Brand> {
  constructor(@InjectModel(Brand.name) protected model: Model<Brand>) {
    super(model);
  }
}

export default BrandRepository;
