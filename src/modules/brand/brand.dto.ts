import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty, Length, Validate } from 'class-validator';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'AtLeastOneRequired', async: false })
class AtLeastOneRequiredConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const obj = args.object as any;
    return obj.name !== undefined || obj.slogan !== undefined;
  }

  defaultMessage(args: ValidationArguments) {
    return 'At least one of "name" or "slogan" must be provided';
  }
}

export class CreateBrandDto {
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @Length(2, 25, { message: 'Name must be between 2 and 25 characters' })
  name: string;

  @IsString({ message: 'Slogan must be a string' })
  @IsNotEmpty({ message: 'Slogan is required' })
  @Length(5, 255, { message: 'Slogan must be at least 5 characters' })
  slogan: string;
}

export class UpdateBrandDto extends PartialType(CreateBrandDto) {
  @Validate(AtLeastOneRequiredConstraint)
  _atLeastOne?: any; //Virtual 3Shan N- Apply Decorator
}
