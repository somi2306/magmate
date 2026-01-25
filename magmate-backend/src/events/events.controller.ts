import { 
  Controller, Get, Post, Body, Param, Delete, Patch, Query, 
  UseGuards, Put, UseInterceptors, UploadedFile 
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { Event, EventStatus, EventType } from './entities/event.entity';
import { User } from '../user/entities/user.entity';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Favorite } from './entities/favorite.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly cloudinaryService: CloudinaryService // Injection du service
  ) {}

  @Get('count')
  async getEventCount(): Promise<number> {
    return this.eventsService.getEventCount();
  }

  @Get()
  async findAll(@Query() filters: { city?: string; type?: string }): Promise<Event[]> {
    return this.eventsService.findAll(filters);
  }
  
  @Get('my-events')
  @UseGuards(FirebaseAuthGuard)
  async findMyEvents(@GetUser() user: User): Promise<Event[]> {
    return this.eventsService.findMyEvents(user.email);
  }
  
  @Post()
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FileInterceptor('image')) // Plus de configuration diskStorage (mémoire par défaut)
  async create(
    @Body() createEventDto: CreateEventDto,
    @GetUser() user: User,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Event> {
    // Si une image est fournie, on l'envoie sur Cloudinary
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file); // Upload
      createEventDto.imageUrl = result.secure_url; // Récupération de l'URL Cloudinary
    }
    return this.eventsService.create(createEventDto, user.email);
  }

  @Get('my-favorites')
  @UseGuards(FirebaseAuthGuard)
  async getFavorites(@GetUser() user: User): Promise<Event[]> {
    return this.eventsService.getFavorites(user.email);
  }

  @Delete(':id/favorite')
  @UseGuards(FirebaseAuthGuard)
  async removeFromFavorites(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<void> {
    return this.eventsService.removeFromFavorites(id, user.email);
  }

  @Post(':id/favorite')
  @UseGuards(FirebaseAuthGuard)
  async addToFavorites(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<Favorite> {
    return this.eventsService.addToFavorites(id, user.email);
  }

  @Delete(':id')
  @UseGuards(FirebaseAuthGuard)
  async deleteEvent(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.eventsService.deleteEvent(id, user.email);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Event> {
    return this.eventsService.findOne(id);
  }

  @Put(':id')
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FileInterceptor('image')) // Plus de configuration diskStorage
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @GetUser() user: User,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Event> {
    // Si un fichier est uploadé, on l'envoie sur Cloudinary et on met à jour l'URL
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file); // Upload
      updateEventDto.imageUrl = result.secure_url; // URL sécurisée
    }
    return this.eventsService.updateEvent(id, updateEventDto, user.email);
  }

  @Get('status/:status')
  async findByStatus(@Param('status') status: string): Promise<Event[]> {
    const uppercaseStatus: EventStatus = status.toUpperCase() as EventStatus;
    return this.eventsService.findByStatus(uppercaseStatus);
  }

  @Patch(':id/approve')
  @UseGuards(FirebaseAuthGuard)
  async approveEvent(@Param('id') id: string): Promise<Event> {
    return this.eventsService.approveEvent(id);
  }

  @Patch(':id/reject')
  @UseGuards(FirebaseAuthGuard)
  async rejectEvent(@Param('id') id: string): Promise<Event> {
    return this.eventsService.rejectEvent(id);
  }

  @Get('stats/by-type')
  async getEventCountByType(): Promise<{ type: EventType; count: number }[]> {
    return this.eventsService.getEventCountByType();
  }

  @Get('stats/by-status')
  async getEventCountByStatus(): Promise<{ status: EventStatus; count: number }[]> {
    return this.eventsService.getEventCountByStatus();
  }
}