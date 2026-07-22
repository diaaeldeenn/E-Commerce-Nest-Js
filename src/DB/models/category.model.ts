import { HydratedDocument, Types } from 'mongoose';
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import slugify from 'slugify';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({
  timestamps: true,
  strictQuery: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Category {
  @Prop({ type: String, required: true, min: 2, max: 25, trim: true })
  name: string;

  @Prop({ type: String })
  slug: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Brand' }] })
  brands: Types.ObjectId[];

  @Prop({ type: String, required: true })
  image: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;

  @Prop({ type: Date })
  deletedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  deletedBy: Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.pre('save', async function () {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, {
      replacement: '-',
      trim: true,
      lower: true,
    });
  }
});

CategorySchema.pre('findOneAndUpdate', async function () {
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

export const CategoryModel = MongooseModule.forFeature([
  { name: Category.name, schema: CategorySchema },
]);
