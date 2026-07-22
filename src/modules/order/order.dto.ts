import { Transform } from 'class-transformer';
import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class CreateCashOrderDto {
  @IsMongoId()
  cartId: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  @IsPhoneNumber('EG')
  phone: string;

  @Transform(({ value }) => (value ? value.trim().toLowerCase() : undefined))
  @IsOptional()
  @IsString()
  couponCode?: string;
}
