import type { Model } from 'mongoose';
import BaseRepository from './base.repository.js';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Cart } from '../models/cart.model.js';

@Injectable()
class CartRepository extends BaseRepository<Cart> {
  constructor(@InjectModel(Cart.name) protected model: Model<Cart>) {
    super(model);
  }
}

export default CartRepository;
