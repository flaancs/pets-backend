import { Test, TestingModule } from "@nestjs/testing";
import { PetsController } from "./pets.controller";
import { PetsService } from "./pets.service";
import { CreatePetDto, FindPetsQueryDto, UpdatePetDto } from "./dto/pet.dto";

describe("PetsController", () => {
  let controller: PetsController;
  let service: jest.Mocked<PetsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PetsController],
      providers: [
        {
          provide: PetsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PetsController>(PetsController);
    service = module.get<PetsService>(PetsService) as jest.Mocked<PetsService>;
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a pet", async () => {
      const createPetDto: CreatePetDto = {
        name: "Buddy",
        type: "Dog",
        breed: "Labrador",
        age: 5,
        userId: 1,
        isSterilized: true,
      };
      const expectedResult: any = { id: 1, ...createPetDto };
      service.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createPetDto);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createPetDto);
    });
  });

  describe("findAll", () => {
    it("should return an array of pets", async () => {
      const query: FindPetsQueryDto = {
        page: 1,
        pageSize: 10,
        name: "Buddy",
        type: "Dog",
      };
      const expectedResult = [
        {
          id: 1,
          name: "Buddy",
          type: "Dog",
          breed: "Labrador",
          age: 5,
          isSterilized: true,
          userId: 1,
        },
      ];
      service.findAll.mockResolvedValue([expectedResult, 1]);

      const [result, total] = await controller.findAll(query);

      expect(result).toEqual(expectedResult);
      expect(total).toEqual(1);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe("update", () => {
    it("should update a pet", async () => {
      const id = "1";
      const updatePetDto: UpdatePetDto = { name: "New Buddy" };
      const expectedResult: any = { id: 1, name: "New Buddy" };
      service.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updatePetDto);

      expect(result).toEqual(expectedResult);
      expect(service.update).toHaveBeenCalledWith(+id, updatePetDto);
    });
  });
});
