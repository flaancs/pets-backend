import {
  IsString,
  IsEmail,
  Length,
  IsPhoneNumber,
  IsOptional,
  MinLength,
} from "class-validator";

export class RegisterUserDto {
  @IsString()
  @Length(2, 100)
  readonly name: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  @Length(6, 20)
  readonly password: string;

  @IsPhoneNumber()
  readonly phoneNumber: string;
}

export class LoginUserDto {
  @IsEmail()
  readonly email: string;

  @IsString()
  @Length(6, 20)
  readonly password: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsPhoneNumber()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  passwordConfirm?: string;
}
