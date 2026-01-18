import { IsNotEmpty, IsNumber, IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateReclamationDto {
  //@IsNumber()
  @IsNotEmpty()
  idCible: number;  // ID du produit concerné par la réclamation

  //@IsString()
  @IsNotEmpty()
  description: string;  // Description de la réclamation

  //@IsString()
  @IsOptional() // La pièce jointe est maintenant optionnelle
  pieceJointe?: string;  // Pièce jointe (nom du fichier ou lien URL)

  //@IsEmail()
  @IsNotEmpty()
  email: string;  // Email de l'utilisateur qui fait la réclamation
}