import type { Model } from 'mongoose';
import BaseRepository from './base.repository.js';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Order } from '../models/order.model.js';

@Injectable()
class OrderRepository extends BaseRepository<Order> {
  constructor(@InjectModel(Order.name) protected model: Model<Order>) {
    super(model);
  }
}

export default OrderRepository;
