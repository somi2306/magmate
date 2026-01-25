import { IsString, IsNotEmpty, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger'

export class CreateImageDto {
  @ApiProperty({
    description: "Le nom du fichier ou l'URL de l'image",
    type: String, // Type attendu
    example: 'image1.jpg', // Exemple de valeur
  })
  @IsString()
  @IsNotEmpty()
  imageURL: string; // Le nom du fichier ou l'URL de l'image

  @ApiProperty({
    description: "L'ID du produit auquel l'image appartient",
    type: Number, // Type attendu
    example: 1, // Exemple de valeur
  })
  @IsInt()
  @IsNotEmpty()
  produitId: number; // ID du produit auquel l'image est associée
}
