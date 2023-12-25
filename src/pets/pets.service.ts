import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Pet } from "./entities/pet.entity";
import { CreatePetDto, FindPetsQueryDto, UpdatePetDto } from "./dto/pet.dto";
import { User } from "@/users/entities/user.entity";
import { formatUserName } from "@/utils/privacy";

@Injectable()
export class PetsService {
  constructor(
    @InjectRepository(Pet)
    private readonly petRepository: Repository<Pet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async create(createPetDto: CreatePetDto): Promise<Pet> {
    try {
      const pet = this.petRepository.create(createPetDto);

      const user = await this.userRepository.findOne({
        where: { id: createPetDto.userId },
      });
      if (!user) {
        throw new BadRequestException("User not found");
      }

      pet.user = user;

      return this.petRepository.save(pet);
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }

  async findAll(query: FindPetsQueryDto): Promise<[any[], number]> {
    try {
      const { pageSize, page, name, type } = query;
      const queryBuilder = this.petRepository.createQueryBuilder("pet");

      queryBuilder.leftJoinAndSelect("pet.user", "user");

      if (name) {
        queryBuilder.where("pet.name ILIKE :name", { name: `%${name}%` });
      }

      if (type) {
        queryBuilder.andWhere("pet.type = :type", { type });
      }

      const [pets, total] = await queryBuilder
        .take(pageSize)
        .skip(pageSize * (page - 1))
        .getManyAndCount();

      const petsWithUserName = pets.map((pet) => {
        return {
          ...pet,
          user: pet.user ? formatUserName(pet.user.name) : null,
        };
      });

      return [petsWithUserName, total];
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }

  async update(id: number, updatePetDto: UpdatePetDto): Promise<Pet> {
    try {
      await this.petRepository.update(id, updatePetDto);
      const updatedPet = await this.petRepository.findOne({ where: { id } });
      if (!updatedPet) {
        throw new NotFoundException("No se ha encontrado la mascota");
      }
      return updatedPet;
    } catch (error) {
      throw new BadRequestException({ message: error.message });
    }
  }
}
