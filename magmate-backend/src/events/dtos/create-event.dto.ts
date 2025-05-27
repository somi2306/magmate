import {
  IsString,
  IsEnum,
  IsDate,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { EventType, EventStatus } from '../entities/event.entity';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  city: string;

  @IsEnum(EventType)
  type: EventType;

  @IsDateString()
  date: Date;

  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus; // Par défaut, l'événement sera 'PENDING'
}