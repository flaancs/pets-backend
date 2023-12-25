import { LoginUserDto } from "@/users/dto/user.dto";
import { UsersService } from "@/users/users.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (user && (await user.validatePassword(password))) {
        const { password, validatePassword, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  async login(loginDto: LoginUserDto) {
    try {
      const { email, password } = loginDto;

      const user = await this.usersService.findByEmail(email);

      if (!user) {
        throw new UnauthorizedException("Email o contraseña incorrectos");
      }

      const passwordIsValid = await user.validatePassword(password);

      if (!passwordIsValid) {
        throw new UnauthorizedException("Email o contraseña incorrectos");
      }

      const payload = { sub: user.id, username: user.email };
      const accessToken = await this.jwtService.signAsync(payload);

      return { access_token: accessToken };
    } catch (error) {
      throw error;
    }
  }
}
