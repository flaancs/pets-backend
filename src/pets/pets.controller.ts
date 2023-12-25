import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { PetsService } from "./pets.service";
import { CreatePetDto, FindPetsQueryDto, UpdatePetDto } from "./dto/pet.dto";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { Request } from "express";

@Controller("pets")
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: Request, @Body() createPetDto: CreatePetDto) {
    const userId = (req.user as any)?.userId;
    return this.petsService.create(userId, createPetDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query() query: FindPetsQueryDto) {
    return this.petsService.findAll(query);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard)
  async update(
    @Param("id") id: string,
    @Req() req: Request,
    @Body() updatePetDto: UpdatePetDto
  ) {
    const userId = (req.user as any)?.userId;
    return this.petsService.update(userId, +id, updatePetDto);
  }
}
