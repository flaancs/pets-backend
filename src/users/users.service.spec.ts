import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { Repository } from "typeorm";
import { RegisterUserDto } from "./dto/user.dto";
import { BadRequestException } from "@nestjs/common";

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
      userRepository.findOne.mockRejectedValue(new BadRequestException("Not found"));
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
      userRepository.findOne.mockRejectedValue(new BadRequestException("Not found"));
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

      // Simulate finding an existing user
      userRepository.findOne.mockResolvedValue(new User());

      await expect(service.create(userDto)).rejects.toThrow(
        BadRequestException
      );
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });
});
