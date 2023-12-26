import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { RegisterUserDto, UpdateUserDto } from "./dto/user.dto";
import { BadRequestException, NotFoundException } from "@nestjs/common";

jest.mock("bcrypt", () => ({
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue("test-salt"),
  hash: jest.fn().mockResolvedValue("hashed-password"),
}));

describe("UsersService", () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
  });

  describe("findOne", () => {
    it("should find a user by ID", async () => {
      const userMock = new User();
      userMock.id = 1;
      userMock.name = "John Doe";
      userRepository.findOne.mockResolvedValue(userMock);

      const result = await service.findOne(1);
      expect(result).toEqual(userMock);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it("should handle errors when finding a user by ID", async () => {
      userRepository.findOne.mockRejectedValue(
        new BadRequestException("Not found")
      );
      await expect(service.findOne(1)).rejects.toThrow(BadRequestException);
    });
  });

  describe("findByEmail", () => {
    it("should find a user by email", async () => {
      const userMock = new User();
      userMock.email = "test@example.com";
      userRepository.findOne.mockResolvedValue(userMock);

      const result = await service.findByEmail("test@example.com");
      expect(result).toEqual(userMock);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });

    it("should handle errors when finding a user by email", async () => {
      userRepository.findOne.mockRejectedValue(
        new BadRequestException("Not found")
      );
      await expect(service.findByEmail("test@example.com")).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("create", () => {
    it("should create a new user", async () => {
      const registerUserDto: RegisterUserDto = {
        name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
        phoneNumber: "1234567890",
      };
      const userMock = new User();
      Object.assign(userMock, registerUserDto, { id: 1 });
      userRepository.save.mockResolvedValue(userMock);

      const result = await service.create(registerUserDto);
      expect(result).toEqual(userMock);
      expect(userRepository.save).toHaveBeenCalledWith(expect.any(User));
    });

    it("should throw BadRequestException if a user with the given email already exists", async () => {
      const userDto: RegisterUserDto = {
        name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
        phoneNumber: "1234567890",
      };

      userRepository.findOne.mockResolvedValue(new User());

      await expect(service.create(userDto)).rejects.toThrow(
        BadRequestException
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update a user's information", async () => {
      const updateUserDto: UpdateUserDto = {
        name: "Updated Name",
        phoneNumber: "9876543210",
        password: "newPassword123",
        passwordConfirm: "newPassword123",
      };
      const existingUser = new User();
      existingUser.id = 1;
      existingUser.name = "Jane Doe";
      existingUser.phoneNumber = "1234567890";
      existingUser.password = "hashed-password";

      userRepository.findOne.mockResolvedValue(existingUser);
      userRepository.save.mockResolvedValue({
        ...existingUser,
        ...updateUserDto,
        password: "hashed-newPassword",
        validatePassword: () => Promise.resolve(true),
      });

      const result = await service.update(1, updateUserDto);

      expect(result.name).toEqual(updateUserDto.name);
      expect(result.phoneNumber).toEqual(updateUserDto.phoneNumber);
      expect(result.password).not.toEqual(updateUserDto.password); // The password should be hashed
      expect(userRepository.save).toHaveBeenCalledWith(expect.any(User));
    });

    it("should throw an error if the user is not found", async () => {
      const updateUserDto: UpdateUserDto = { name: "Updated Name" };
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.update(1, updateUserDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it("should throw an error if the passwords do not match", async () => {
      const updateUserDto: UpdateUserDto = {
        password: "newPassword123",
        passwordConfirm: "differentPassword",
      };
      const existingUser = new User();
      existingUser.id = 1;

      userRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.update(1, updateUserDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe("findUserPets", () => {
    it("should return pets for a given user", async () => {
      const userId = 1;

      const userWithPets = new User();
      userWithPets.id = userId;

      const userPets = [
        {
          id: 1,
          name: "Buddy",
          type: "dog",
          breed: "Golden Retriever",
          age: 2,
          isSterilized: true,
          user: userWithPets,
        },
      ];

      userWithPets.pets = userPets;
      userRepository.findOne.mockResolvedValue(userWithPets);

      const result = await service.findUserPets(userId);

      expect(result).toEqual(userPets);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ["pets"],
      });
    });

    it("should return an empty array if the user has no pets", async () => {
      const userId = 2;
      const userWithNoPets = new User();
      userWithNoPets.id = userId;
      userWithNoPets.pets = [];

      userRepository.findOne.mockResolvedValue(userWithNoPets);

      const result = await service.findUserPets(userId);

      expect(result).toEqual([]);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ["pets"],
      });
    });

    it("should throw NotFoundException if the user does not exist", async () => {
      const userId = 999;
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.findUserPets(userId)).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
