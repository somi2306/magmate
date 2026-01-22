import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';  // Importer les décorateurs Swagger
import { ImageService } from '../services/image.service';
import { CreateImageDto } from '../dto/create-image.dto/create-image.dto';

@ApiTags('Images')  // Catégorie dans Swagger
@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post()
  @ApiOperation({
    summary: 'Créer une nouvelle image associée à un produit',  // Description de l’opération
  })
  @ApiBody({
    type: CreateImageDto,  // Définir le DTO attendu dans le corps de la requête
    description: 'DTO pour la création d\'une image',  // Description du corps
  })
  @ApiResponse({
    status: 201,
    description: 'Image créée avec succès',  // Réponse en cas de succès
  })
  @ApiResponse({
    status: 400,
    description: 'Mauvaise requête, vérifier les données envoyées',  // Réponse en cas d’erreur
  })
  @ApiResponse({
    status: 404,
    description: 'Produit non trouvé pour associer l\'image',  // Réponse si le produit n’existe pas
  })
  create(@Body() dto: CreateImageDto) {
    return this.imageService.create(dto);  // Appeler la méthode du service pour créer l'image
  }
}
