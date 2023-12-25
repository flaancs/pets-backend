import { Test, TestingModule } from "@nestjs/testing";
import { LocalStrategy } from "./local.strategy";
import { AuthService } from "./auth.service";
import { UnauthorizedException } from "@nestjs/common";

jest.mock("./auth.service");

describe("LocalStrategy", () => {
  let localStrategy: LocalStrategy;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalStrategy, AuthService],
    }).compile();

    localStrategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get(AuthService) as jest.Mocked<AuthService>;
  });

  it("should validate and return the user for correct credentials", async () => {
    const userMock = { id: 1, email: "test@example.com" };
    authService.validateUser.mockResolvedValue(userMock);

    const result = await localStrategy.validate("test@example.com", "password");
    expect(result).toEqual(userMock);
    expect(authService.validateUser).toHaveBeenCalledWith(
      "test@example.com",
      "password"
    );
  });

  it("should throw an UnauthorizedException for incorrect credentials", async () => {
    authService.validateUser.mockResolvedValue(null);

    await expect(
      localStrategy.validate("wrong@example.com", "password")
    ).rejects.toThrow(UnauthorizedException);
  });
});
