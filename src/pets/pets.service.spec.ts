import { Test, TestingModule } from "@nestjs/testing";
import { PetsService } from "./pets.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { Pet } from "./entities/pet.entity";
import { CreatePetDto, FindPetsQueryDto, UpdatePetDto } from "./dto/pet.dto";
import { User } from "@/users/entities/user.entity";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { formatUserName } from "@/utils/privacy";

describe("PetsService", () => {
  let service: PetsService;
  let petRepository: Repository<Pet>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PetsService,
        {
          provide: getRepositoryToken(Pet),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<PetsService>(PetsService);
    petRepository = module.get<Repository<Pet>>(getRepositoryToken(Pet));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe("create", () => {
    it("should create a pet", async () => {
      const createPetDto: CreatePetDto = {
        name: "Buddy",
        type: "Dog",
        breed: "Labrador",
        age: 5,
        isSterilized: true,
      };
      const user = new User();
      user.id = 1;
      userRepository.findOne = jest.fn().mockResolvedValue(user);
      petRepository.create = jest.fn().mockReturnValue(createPetDto);
      petRepository.save = jest.fn().mockResolvedValue(createPetDto);

      const result = await service.create(1, createPetDto);

      expect(result).toEqual(createPetDto);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(petRepository.create).toHaveBeenCalledWith(createPetDto);
      expect(petRepository.save).toHaveBeenCalledWith(createPetDto);
    });

    it("should throw BadRequestException if user does not exist", async () => {
      const createPetDto: CreatePetDto = {
        name: "Buddy",
        type: "Dog",
        breed: "Labrador",
        age: 5,
        isSterilized: true,
      };
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      try {
        await service.create(999, createPetDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });

  describe("findAll", () => {
    it("should return a list of pets with pagination", async () => {
      const findPetsQueryDto: FindPetsQueryDto = {
        page: 1,
        pageSize: 10,
        name: "Buddy",
        type: "dog",
      };

      const pets = [
        {
          id: 1,
          name: "Buddy",
          type: "dog",
          breed: "Labrador",
          age: 5,
          isSterilized: true,
          user: { id: 1, name: "John Doe" },
        },
      ];

      petRepository.createQueryBuilder = jest.fn(
        () =>
          ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            andWhere: jest.fn().mockReturnThis(),
            take: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            getManyAndCount: jest.fn().mockResolvedValue([pets, 1]),
          }) as unknown as SelectQueryBuilder<Pet>
      );

      const [result, total] = await service.findAll(findPetsQueryDto);

      expect(result).toEqual(
        pets.map((pet) => ({ ...pet, user: formatUserName(pet.user.name) }))
      );
      expect(total).toEqual(1);
      expect(petRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update a pet", async () => {
      const petId = 1;
      const updatePetDto: UpdatePetDto = {
        name: "New Buddy",
      };
      const newUser = new User();
      newUser.id = 1;

      const existingPet = new Pet();
      existingPet.id = petId;
      existingPet.user = newUser;
      petRepository.update = jest.fn();
      petRepository.findOne = jest.fn().mockResolvedValue(existingPet);

      await service.update(newUser.id, petId, updatePetDto);

      expect(petRepository.update).toHaveBeenCalledWith(petId, updatePetDto);
      expect(petRepository.findOne).toHaveBeenCalledWith({
        where: { id: petId },
      });
    });

    it("should throw BadRequestException when pet does not belong to user", async () => {
      const petId = 1;
      const updatePetDto: UpdatePetDto = {
        name: "New Buddy",
      };

      const existingPet = new Pet();
      existingPet.id = petId;
      petRepository.update = jest.fn();
      petRepository.findOne = jest.fn().mockResolvedValue(existingPet);

      try {
        await service.update(2, petId, updatePetDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });

    it("should throw BadRequestException if the pet does not exist", async () => {
      const petId = 999; // Non-existing pet ID
      const updatePetDto: UpdatePetDto = { name: "New Buddy" };
      petRepository.findOne = jest.fn().mockResolvedValue(null);

      try {
        await service.update(1, petId, updatePetDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
      }
    });
  });
});
