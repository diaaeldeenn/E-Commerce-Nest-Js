import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsFutureDate', async: false })
class IsFutureDateConstraint implements ValidatorConstraintInterface {
  validate(value: Date) {
    if (!(value instanceof Date) || isNaN(value.getTime())) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return value >= today;
  }

  defaultMessage() {
    return 'Date Must Be Today Or In The Future';
  }
}

@ValidatorConstraint({ name: 'IsAfterFromDate', async: false })
class IsAfterFromDateConstraint implements ValidatorConstraintInterface {
  validate(toDate: Date, args: ValidationArguments) {
    if (!(toDate instanceof Date) || isNaN(toDate.getTime())) {
      return false;
    }

    const object = args.object as CreateCouponDto | UpdateCouponDto;

    if (!object.fromDate) {
      return true;
    }

    return toDate > object.fromDate;
  }

  defaultMessage() {
    return 'To Date Must Be Greater Than From Date';
  }
}

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  amount: number;

  @Type(() => Date)
  @IsDate()
  @Validate(IsFutureDateConstraint)
  fromDate: Date;

  @Type(() => Date)
  @IsDate()
  @Validate(IsAfterFromDateConstraint)
  toDate: Date;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  minOrderPrice?: number;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateCouponDto {
  @IsString()
  @IsOptional()
  code?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  amount?: number;

  @Type(() => Date)
  @IsDate()
  @Validate(IsFutureDateConstraint)
  @IsOptional()
  fromDate?: Date;

  @Type(() => Date)
  @IsDate()
  @Validate(IsAfterFromDateConstraint)
  @IsOptional()
  toDate?: Date;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  minOrderPrice?: number;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ApplyCouponDto {
  @Transform(({ value }) => value?.trim().toLowerCase())
  @IsString()
  @IsNotEmpty()
  code: string;
}