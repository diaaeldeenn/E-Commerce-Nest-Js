import { HydratedDocument, Types } from 'mongoose';
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import slugify from 'slugify';

export type ProductDocument = HydratedDocument<Product>;

@Schema({
  timestamps: true,
  strictQuery: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Product {
  @Prop({ type: String, required: true, min: 2, max: 25, trim: true })
  name: string;

  @Prop({ type: String, min: 5, trim: true })
  description: string;

  @Prop({ type: String })
  slug: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: Number })
  discount: number;

  @Prop({ type: Number })
  rateNum: number;

  @Prop({ type: Number })
  rateAvg: number;

  @Prop({ type: Number, required: true })
  stock: number;

  @Prop({ type: Types.ObjectId, ref: 'Brand', required: true })
  brandId: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: String, required: true })
  mainImage: string;

  @Prop({ type: [String] })
  subImages: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;

  @Prop({ type: Date })
  deletedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  deletedBy: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.pre('save', async function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      replacement: '-',
      trim: true,
      lower: true,
    });
  }
});

ProductSchema.pre('findOneAndUpdate', async function () {
  const update = this.getUpdate() as any;

  if (update?.name) {
    update.slug = slugify(update.name, {
      replacement: '-',
      trim: true,
      lower: true,
    });

    this.setUpdate(update);
  }
});

export const ProductModel = MongooseModule.forFeature([
  { name: Product.name, schema: ProductSchema },
]);
