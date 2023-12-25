import {
  BadRequestException,
  Injectable,
  PlainLiteralObject,
} from "@nestjs/common";
import { User } from "./entities/user.entity";
import { RegisterUserDto } from "./dto/user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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

  async create(registerUserDto: RegisterUserDto): Promise<PlainLiteralObject> {
    try {
      const { name, email, password, phoneNumber } = registerUserDto;

      if (await this.findByEmail(email)) {
        throw new BadRequestException({
          message: "User with this email already exists",
        });
      }

      const salt = await genSalt();
      const hashedPassword = await hash(password, salt);

      const user = new User();

      user.name = name;
      user.email = email;
      user.password = hashedPassword;
      user.phoneNumber = phoneNumber;

      return this.userRepository.save(user);
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }
}
