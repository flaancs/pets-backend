import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersService } from "@/users/users.service";
import { LoginUserDto, RegisterUserDto } from "@/users/dto/user.dto";
import { Public } from "./public.decorator";
import { LocalAuthGuard } from "./local-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @Post("register")
  async register(@Body() registerUserDto: RegisterUserDto) {
    try {
      return this.usersService.create(registerUserDto);
    } catch (error) {
      throw error;
    }
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Body() loginDto: LoginUserDto) {
    return this.authService.login(loginDto);
  }
}
