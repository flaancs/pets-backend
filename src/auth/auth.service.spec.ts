import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import { User } from "@/users/entities/user.entity";
import { UsersService } from "@/users/users.service";

jest.mock("@/users/users.service");
jest.mock("@nestjs/jwt");

describe("AuthService", () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UsersService, JwtService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService) as jest.Mocked<UsersService>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;
  });

  describe("validateUser", () => {
    it("should validate and return the user if credentials are valid", async () => {
      const userMock = new User();
      userMock.id = 1;
      userMock.email = "test@example.com";
      userMock.password = "hashed-password";
      userMock.validatePassword = jest.fn().mockResolvedValue(true);
      userMock.name = "Test User";
      userMock.phoneNumber = "1234567890";
      userMock.isAdmin = false;

      usersService.findByEmail.mockResolvedValue(userMock);

      const result = await authService.validateUser(
        "test@example.com",
        "correct-password"
      );
      expect(result).toEqual({
        id: userMock.id,
        name: userMock.name,
        email: userMock.email,
        phoneNumber: userMock.phoneNumber,
        isAdmin: userMock.isAdmin,
      });
      expect(userMock.validatePassword).toHaveBeenCalledWith(
        "correct-password"
      );
    });

    it("should return null if user does not exist", async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await authService.validateUser(
        "nonexistent@example.com",
        "password"
      );
      expect(result).toBeNull();
    });

    it("should return null if password is invalid", async () => {
      const userMock = new User();
      userMock.validatePassword = jest.fn().mockResolvedValue(false);
      usersService.findByEmail.mockResolvedValue(userMock);

      const result = await authService.validateUser(
        "test@example.com",
        "wrong-password"
      );
      expect(result).toBeNull();
    });
  });

  describe("login", () => {
    it("should return access token for valid credentials", async () => {
      const userMock = new User();
      userMock.id = 1;
      userMock.email = "test@example.com";
      userMock.password = "hashed-password";
      userMock.validatePassword = jest.fn().mockResolvedValue(true);

      usersService.findByEmail.mockResolvedValue(userMock);
      jwtService.signAsync.mockResolvedValue("generated-jwt-token");

      const result = await authService.login({
        email: "test@example.com",
        password: "correct-password",
      });
      expect(result).toEqual({ access_token: "generated-jwt-token" });
    });

    it("should throw an UnauthorizedException for incorrect email", async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({ email: "wrong@example.com", password: "password" })
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw an UnauthorizedException for incorrect password", async () => {
      const userMock = new User();
      userMock.email = "test@example.com";
      userMock.validatePassword = jest.fn().mockResolvedValue(false);
      usersService.findByEmail.mockResolvedValue(userMock);

      await expect(
        authService.login({
          email: "test@example.com",
          password: "wrong-password",
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should generate a JWT token for valid login", async () => {
      const userMock = new User();
      userMock.id = 1;
      userMock.email = "test@example.com";
      userMock.validatePassword = jest.fn().mockResolvedValue(true);

      usersService.findByEmail.mockResolvedValue(userMock);
      jwtService.signAsync.mockResolvedValue("generated-jwt-token");

      const result = await authService.login({
        email: "test@example.com",
        password: "correct-password",
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: userMock.id,
        username: userMock.email,
      });
      expect(result.access_token).toBeDefined();
    });
  });
});
