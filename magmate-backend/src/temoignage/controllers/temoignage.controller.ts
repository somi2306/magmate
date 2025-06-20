// bard app/src backend/temoignage/controllers/temoignage.controller.ts
import { Controller, Post, Get, Body, UseGuards, Delete, Param, ValidationPipe } from '@nestjs/common';
import { TemoignageService } from '../services/services/temoignage.service';
import { CreateTemoignageDto } from '../dto/create-temoignage.dto';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserService } from 'src/user/user.service';

@Controller('temoignages')
export class TemoignageController {
  constructor(
    private readonly temoignageService: TemoignageService,
    private readonly userService: UserService,
  ) {}

  @Post()
  @UseGuards(FirebaseAuthGuard)
  async createTemoignage(
    @Body(new ValidationPipe()) createTemoignageDto: CreateTemoignageDto,
    @GetUser() user: any,
  ) {
    const dbUser = await this.userService.findByEmail(user.email);
    if (!dbUser) {
      throw new Error('User not found in database.');
    }

    // Pass dbUser.id as a separate argument to the service method
    return this.temoignageService.createTemoignage(createTemoignageDto, dbUser.id);
  }

  @Get()
  async getAllTemoignages() {
    return this.temoignageService.findAllTemoignages();
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  async deleteTemoignage(
    @Param('id') id: string,
    @GetUser() user: any,
  ) {
    return this.temoignageService.deleteTemoignage(id);
  }
}