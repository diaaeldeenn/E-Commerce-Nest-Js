import type { Model } from 'mongoose';
import BaseRepository from './base.repository.js';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Category } from '../models/category.model.js';

@Injectable()
class CategoryRepository extends BaseRepository<Category> {
  constructor(@InjectModel(Category.name) protected model: Model<Category>) {
    super(model);
  }
}

export default CategoryRepository;
