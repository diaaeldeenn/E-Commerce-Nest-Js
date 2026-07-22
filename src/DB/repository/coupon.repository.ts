import type { Model } from 'mongoose';
import BaseRepository from './base.repository.js';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Coupon } from '../models/coupon.model.js';

@Injectable()
class CouponRepository extends BaseRepository<Coupon> {
  constructor(@InjectModel(Coupon.name) protected model: Model<Coupon>) {
    super(model);
  }
}

export default CouponRepository;
