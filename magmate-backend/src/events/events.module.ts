import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { User } from '../user/entities/user.entity';
import { Favorite } from './entities/favorite.entity';
import { UserModule } from 'src/user/user.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module'; // Ajout de l'import

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, User, Favorite]), 
    UserModule, 
    CloudinaryModule // Ajout du module
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}