// marketplace backend/dto/create-magasin.dto/create-magasin.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MagasinStatus } from '../../entities/magasin.entity'; // Importer l'enum

export class CreateMagasinDto {
  @ApiProperty({
    description: 'Le nom du magasin',
    type: String,
    example: 'Mon Magasin',
  })
  @IsString()
  @IsNotEmpty()
  nom: string;

  @ApiProperty({
    description: 'La description du magasin',
    type: String,
    example: "Magasin d'électroménager et accessoires",
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: "Le nom de l'image du magasin",
    type: String,
    example: 'magasin.jpg',
  })
  @IsString()
  @IsNotEmpty()
  image: string;

  @ApiProperty({
    description: 'La localisation du magasin',
    type: String,
    example: 'Rue de Paris, 123',
  })
  @IsString()
  @IsNotEmpty()
  localisation: string;

  @ApiProperty({
    description: "Les horaires d'ouverture du magasin",
    type: String,
    example: '9:00 AM - 6:00 PM',
  })
  @IsString()
  @IsNotEmpty()
  horaire: string;

  @ApiProperty({
    description: 'Le numéro de téléphone du magasin',
    type: String,
    example: '0123456789',
  })
  @IsString()
  @IsNotEmpty()
  telephone: string;

  @ApiProperty({
    description: 'La ville où est situé le magasin',
    type: String,
    example: 'Paris',
  })
  @IsString()
  @IsNotEmpty()
  ville: string;

  @ApiProperty({
    description: "L'ID de l'utilisateur (propriétaire du magasin)",
    type: String,
    example: 'd4d9c564-f3c1-40b8-bfcf-6f7b3583bb90',
  })
  @IsUUID()
  @IsNotEmpty()
  proprietaireId: string;

  @ApiProperty({
    description: 'Statut d\'approbation du magasin (pending, approved, rejected)',
    enum: MagasinStatus, // Utilisation de l'enum
    example: MagasinStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(MagasinStatus) // Validation de l'enum
  estApprouve?: MagasinStatus;
}