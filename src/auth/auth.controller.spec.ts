import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersService } from "@/users/users.service";
import { RegisterUserDto, LoginUserDto } from "@/users/dto/user.dto";

jest.mock("./auth.service");
jest.mock("@/users/users.service");

describe("AuthController", () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, UsersService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService) as jest.Mocked<AuthService>;
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
  });

  describe("register", () => {
    it("should successfully register a user", async () => {
      const userDto: RegisterUserDto = {
        name: "John Doe",
        email: "john@example.com",
        password: "strongpassword",
        phoneNumber: "1234567890",
      };
      const expectedResponse = {
        ...userDto,
        id: 1,
        validatePassword: () => Promise.resolve(true),
      };
      usersService.create.mockResolvedValue(expectedResponse);

      expect(await controller.register(userDto)).toEqual(expectedResponse);
      expect(usersService.create).toHaveBeenCalledWith(userDto);
    });

    it("should handle errors during registration", async () => {
      const userDto: RegisterUserDto = {
        name: "John Doe",
        email: "john@example.com",
        password: "strongpassword",
        phoneNumber: "1234567890",
      };
      const error = new Error("Failed to register");
      usersService.create.mockRejectedValue(error);

      await expect(controller.register(userDto)).rejects.toThrow(error);
    });
  });

  describe("login", () => {
    it("should successfully log in a user", async () => {
      const loginDto: LoginUserDto = {
        email: "john@example.com",
        password: "strongpassword",
      };
      const expectedResponse = { accessToken: "some-token" };
      authService.login.mockResolvedValue(expectedResponse as any);

      expect(await controller.login(loginDto)).toEqual(expectedResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });
  });
});
