export class RegisterUserDto {
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly phoneNumber: string;
  readonly isAdmin: boolean;
}

export class LoginUserDto {
  readonly email: string;
  readonly password: string;
}
