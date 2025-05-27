import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity'; // Import de l'entité Event
import { User } from '../user/entities/user.entity'; // Import de l'entité User
import { Favorite } from './entities/favorite.entity'; // Import de l'entité Favorite
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event, User, Favorite]), UserModule],

  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}