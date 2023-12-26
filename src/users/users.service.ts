import {
  BadRequestException,
  Injectable,
  NotFoundException,
  PlainLiteralObject,
} from "@nestjs/common";
import { User } from "./entities/user.entity";
import { RegisterUserDto, UpdateUserDto } from "./dto/user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { genSalt, hash } from "bcrypt";
import { Pet } from "@/pets/entities/pet.entity";

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

  async update(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(userId);
    if (!user) {
      throw new BadRequestException(`User with ID ${userId} not found`);
    }

    if (
      updateUserDto.password &&
      updateUserDto.password !== updateUserDto.passwordConfirm
    ) {
      throw new BadRequestException("Passwords do not match");
    }

    if (updateUserDto.password) {
      const salt = await genSalt();
      user.password = await hash(updateUserDto.password, salt);
    }

    user.name = updateUserDto.name ?? user.name;
    user.phoneNumber = updateUserDto.phoneNumber ?? user.phoneNumber;

    return this.userRepository.save(user);
  }

  async findUserPets(userId: number): Promise<Pet[]> {
    const userWithPets = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['pets'],
    });

    if (!userWithPets) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return userWithPets.pets;
  }
}
