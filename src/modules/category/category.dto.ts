import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 25)
  name: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  brands?: string[];
}

export class UpdateCategoryDto {
  @IsMongoId()
  categoryId: string;

  @IsString()
  @Length(2, 25)
  @IsOptional()
  name?: string;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  brands?: string[];
}
