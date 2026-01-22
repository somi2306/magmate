
import { Controller, Post, Get, Param, Body, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // Importez FileInterceptor
import { ReclamationService } from '../services/reclamation.service';
import { CreateReclamationDto } from '../dto/create-reclamation.dto';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { diskStorage } from 'multer'; // Pour configurer la destination de stockage
import { extname } from 'path'; // Pour récupérer l'extension du fichier

@Controller('reclamations')
export class ReclamationController {
  constructor(private readonly reclamationService: ReclamationService) {}

  // Route pour récupérer toutes les réclamations d'un produit
  @Get(':productId')
  async getReclamations(@Param('productId') productId: number) {
    return this.reclamationService.getReclamationsByProductId(productId);
  }

  // Route pour ajouter une réclamation à un produit
@Post(':productId')
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FileInterceptor('pieceJointe')) // Par défaut : Memory Storage
  async addReclamation(
    @Param('productId') productId: number,
    @Body() createReclamationDto: CreateReclamationDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: RequestWithUser['user']
  ) {
    createReclamationDto.idCible = productId;

    // On passe le fichier au service qui gèrera l'upload Cloudinary
    return this.reclamationService.createReclamation(
      createReclamationDto,
      user.email,
      file
    );
  }
  // NOUVELLE ROUTE : Récupérer toutes les réclamations (pour l'admin)
  @Get()
  // @UseGuards(FirebaseAuthGuard) // Optionnel: Ajouter un guard pour les rôles d'administrateur si nécessaire
  async getAllReclamations() {
    return this.reclamationService.getAllReclamations();
  }
}