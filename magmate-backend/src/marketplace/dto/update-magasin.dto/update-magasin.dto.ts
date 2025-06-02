// marketplace backend/dto/update-magasin.dto/update-magasin.dto.ts
import { IsOptional, IsString, IsPhoneNumber, IsEnum } from 'class-validator'; // Importer IsEnum
import { MagasinStatus } from '../../entities/magasin.entity'; // Importer l'enum

export class UpdateMagasinDto {
  @IsOptional()
  @IsString()
  nom?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  localisation?: string;

  @IsOptional()
  @IsString()
  horaire?: string;

  @IsOptional()
  @IsPhoneNumber('FR')
  telephone?: string;

  @IsOptional()
  @IsString()
  ville?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsEnum(MagasinStatus) // Utilisation de l'enum pour la validation
  estApprouve?: MagasinStatus; // Utilisation de l'enum pour le type
}