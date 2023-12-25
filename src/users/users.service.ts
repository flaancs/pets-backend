import { BadRequestException, Injectable } from "@nestjs/common";
import { User } from "./entities/user.entity";
import { LoginUserDto, RegisterUserDto } from "./dto/user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { ILike, Repository } from "typeorm";
import { genSalt, hash } from "bcrypt";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async findOne(id: number): Promise<User> {
    try {
      return this.userRepository.findOne({ where: { id } });
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }

  async findByEmail(email: string): Promise<User> {
    try {
      return this.userRepository.findOne({ where: { email } });
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }

  async create(registerUserDto: RegisterUserDto): Promise<User> {
    try {
      const { name, email, password, phoneNumber, isAdmin } = registerUserDto;

      if (!name || !email || !password || !phoneNumber) {
        throw new BadRequestException({
          message: "Todos los campos son requeridos",
        });
      }

      if (password.length < 6) {
        throw new BadRequestException({
          message: "La contraseña debe contener al menos 6 caracteres",
        });
      }

      if (await this.findByEmail(email)) {
        throw new BadRequestException({
          message: "Ya existe un usuario con este correo electrónico",
        });
      }

      const salt = await genSalt();
      const hashedPassword = await hash(password, salt);

      const user = new User();

      user.name = name;
      user.email = email;
      user.password = hashedPassword;
      user.phoneNumber = phoneNumber;
      user.isAdmin = isAdmin;

      return this.userRepository.save(user);
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }
}
