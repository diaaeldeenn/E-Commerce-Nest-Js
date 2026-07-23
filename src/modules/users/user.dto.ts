import { Optional } from '@nestjs/common';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
  Length,
  Matches,
  Max,
  Min,
  registerDecorator,
  ValidateIf,
  ValidationOptions,
} from 'class-validator';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { GenderEnum } from '../../common/enum/user.enum';

@ValidatorConstraint({ name: 'matchValue', async: false })
export class matchValue implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    return args.value === args.object[args.constraints[0]];
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} Not Match With ${args.constraints[0]}`;
  }
}

export function IsMatch(
  constraints: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints,
      validator: matchValue,
    });
  };
}

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 20)
  userName: string;
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;
  @IsInt()
  @IsNotEmpty()
  @Min(18)
  age: number;

  @IsMatch(['password'])
  @ValidateIf((data: SignUpDto) => {
    return Boolean(data.password);
  })
  cPassword: string;
  @IsPhoneNumber()
  phone: string;
  @IsEnum(GenderEnum)
  gender: GenderEnum;
}

export class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  password: string;
}

export class UpdateProfileDto {
  @Optional()
  @IsString()
  @IsNotEmpty()
  @Length(3, 20)
  userName: string;
  @Optional()
  @IsInt()
  @IsNotEmpty()
  @Min(18)
  age: number;
  @Optional()
  @IsPhoneNumber()
  phone: string;
  @Optional()
  @IsEnum(GenderEnum)
  gender: GenderEnum;
}

export class UpdatePasswordDto {
  @IsNotEmpty()
  oldPassword: string;
  @IsNotEmpty()
  @IsStrongPassword()
  newPassword: string;
  @IsMatch(['newPassword'])
  @ValidateIf((data: UpdatePasswordDto) => {
    return Boolean(data.newPassword);
  })
  confirmPassword: string;
}

export class forgetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class confirmPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, {
    message: 'OTP must be exactly 6 digits',
  })
  otp: string;
}

export class resetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @IsNotEmpty()
  @IsStrongPassword()
  newPassword: string;
  @IsMatch(['newPassword'])
  @ValidateIf((data: resetPasswordDto) => {
    return Boolean(data.newPassword);
  })
  rePassword: string;
}
