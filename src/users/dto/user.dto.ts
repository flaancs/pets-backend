export class RegisterUserDto {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly phoneNumber: string;
}

export class LoginUserDto {
  readonly email: string;
  readonly password: string;
}
