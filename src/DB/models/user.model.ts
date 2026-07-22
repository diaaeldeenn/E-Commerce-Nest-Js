import { HydratedDocument, Types } from 'mongoose';
import { GenderEnum, RoleEnum } from '../../common/enum/user.enum.js';
import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  strictQuery: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class User {
  @Prop({ type: String, required: true, min: 2, max: 25, trim: true })
  userName: string;
  @Prop({
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;
  @Prop({
    type: String,
    minLength: 8,
  })
  password: string;
  @Prop({ type: Number, min: 18 })
  age: number;
  @Prop({ type: String, trim: true })
  phone?: string;
  @Prop({ type: String, trim: true })
  address?: string;
  @Prop({
    type: String,
    enum: Object.values(GenderEnum),
    default: GenderEnum.male,
  })
  gender?: GenderEnum;
  @Prop({ type: String, enum: Object.values(RoleEnum), default: RoleEnum.user })
  role: RoleEnum;
  @Prop({ type: String })
  profilePic?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Product' }] })
  wishList: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
export const UserModel = MongooseModule.forFeature([
  { name: User.name, schema: UserSchema },
]);
