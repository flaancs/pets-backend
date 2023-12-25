import { Body, Controller, Patch, Req, UseGuards } from "@nestjs/common";
import { UpdateUserDto } from "./dto/user.dto";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { Request } from "express";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch()
  @UseGuards(JwtAuthGuard)
  async update(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const userId = (req.user as any)?.userId;
    return this.usersService.update(userId, updateUserDto);
  }
}
