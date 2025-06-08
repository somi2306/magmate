
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
  @UseInterceptors(
    FileInterceptor('pieceJointe', { // 'pieceJointe' doit correspondre au nom du champ dans le FormData du frontend
      storage: diskStorage({
        destination: './public/reclamations', // Dossier où stocker les fichiers
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`); // Nom du fichier final
        },
      }),
    })
  )
  async addReclamation(
    @Param('productId') productId: number,
    @Body() createReclamationDto: CreateReclamationDto,
    @UploadedFile() file: Express.Multer.File, // Récupérer le fichier téléchargé
    @GetUser() user: RequestWithUser['user']
  ) {
    // Note: Le DTO ne sera pas directement rempli avec le fichier, donc nous l'assignons manuellement.
    // Les autres champs du DTO (description, email) seront automatiquement parsés si envoyés en tant que champs de texte dans FormData.
    createReclamationDto.idCible = productId;

    // Assigner le nom du fichier téléchargé à pieceJointe
    if (file) {
      createReclamationDto.pieceJointe = file.filename;
    } else {
      createReclamationDto.pieceJointe = ''; // Ou gérer comme non requis si c'est le cas
    }

    return this.reclamationService.createReclamation(
      createReclamationDto,
      user.email
    );
  }

  // NOUVELLE ROUTE : Récupérer toutes les réclamations (pour l'admin)
  @Get()
  // @UseGuards(FirebaseAuthGuard) // Optionnel: Ajouter un guard pour les rôles d'administrateur si nécessaire
  async getAllReclamations() {
    return this.reclamationService.getAllReclamations();
  }
}