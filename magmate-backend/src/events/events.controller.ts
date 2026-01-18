
import { Controller, Get, Post, Body, Param, Delete, Patch, Query, UseGuards, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dtos/create-event.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { Event, EventStatus } from './entities/event.entity'; // Import EventStatus
import { User } from '../user/entities/user.entity';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { Favorite } from './entities/favorite.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { EventType } from './entities/event.entity'; 
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // Nouvelle route pour récupérer le nombre total d'événements (déplacée en haut)
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
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `event-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|jpg)$/)) {
          return callback(
            new Error('Seuls les fichiers JPG, JPEG et PNG sont autorisés'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 2 * 1024 * 1024, // 2 Mo
      },
    }),
  )
  async create(
    @Body() createEventDto: CreateEventDto,
    @GetUser() user: User,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Event> {
    // Ajoute l'URL de l'image uploadée si présente
    if (file) {
      createEventDto.imageUrl = `http://localhost:3000/uploads/${file.filename}`;
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
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        callback(null, `event-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, callback) => {
      if (!file.mimetype.match(/^image\/(jpeg|png|jpg)$/)) {
        return callback(
          new Error('Seuls les fichiers JPG, JPEG et PNG sont autorisés'),
          false,
        );
      }
      callback(null, true);
    },
    limits: {
      fileSize: 2 * 1024 * 1024, // 2 Mo
    },
  }),
)
async update(
  @Param('id') id: string,
  @Body() updateEventDto: UpdateEventDto,
  @GetUser() user: User,
  @UploadedFile() file?: Express.Multer.File,
): Promise<Event> {
  // Si un fichier est uploadé, on met à jour l'imageUrl
  if (file) {
    updateEventDto.imageUrl = `http://localhost:3000/uploads/${file.filename}`;
  }
  return this.eventsService.updateEvent(id, updateEventDto, user.email);
  }

    // Nouvelle route pour récupérer les événements par statut
  @Get('status/:status')
  async findByStatus(@Param('status') status: string): Promise<Event[]> {
    // Convertir le statut en majuscules pour correspondre à l'énumération EventStatus
    const uppercaseStatus: EventStatus = status.toUpperCase() as EventStatus;
    return this.eventsService.findByStatus(uppercaseStatus);
  }

  // Nouvelle route pour approuver un événement
  @Patch(':id/approve')
  @UseGuards(FirebaseAuthGuard) // L'admin doit être authentifié pour approuver
  async approveEvent(@Param('id') id: string): Promise<Event> {
    return this.eventsService.approveEvent(id);
  }

  // Nouvelle route pour rejeter un événement
  @Patch(':id/reject')
  @UseGuards(FirebaseAuthGuard) // L'admin doit être authentifié pour rejeter
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