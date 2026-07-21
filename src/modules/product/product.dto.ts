import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 25)
  name: string;

  @IsString()
  @IsOptional()
  @Length(5)
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discount?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stock: number;

  @IsMongoId()
  brandId: string;

  @IsMongoId()
  categoryId: string;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @Length(2, 25)
  name?: string;

  @IsString()
  @IsOptional()
  @Length(5)
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  discount?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsMongoId()
  @IsOptional()
  brandId?: string;

  @IsMongoId()
  @IsOptional()
  categoryId?: string;
}

export class DeleteProductDto {
  @IsMongoId()
  productId: string;
}
