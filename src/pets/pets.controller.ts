import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { PetsService } from "./pets.service";
import { CreatePetDto, FindPetsQueryDto, UpdatePetDto } from "./dto/pet.dto";

@Controller("pets")
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  async create(@Body() createPetDto: CreatePetDto) {
    return this.petsService.create(createPetDto);
  }

  @Get()
  async findAll(@Query() query: FindPetsQueryDto) {
    return this.petsService.findAll(query);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() updatePetDto: UpdatePetDto) {
    return this.petsService.update(+id, updatePetDto);
  }
}
