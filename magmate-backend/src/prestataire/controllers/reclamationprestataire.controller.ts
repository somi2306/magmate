import { Body, Controller, Param, Post, UseGuards, UseInterceptors, UploadedFile, Get } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ReclamationPrestataireService } from '../services/reclamation-prestataire.service';
import { CreateReclamationPrestataireDto } from '../dto/create-reclamation-prestataire.dto';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Controller('prestataires/reclamations')
export class ReclamationPrestataireController {
  constructor(
    private readonly reclamationService: ReclamationPrestataireService,
    private readonly cloudinaryService: CloudinaryService
  ) {}

@Get()
  async getAllReclamations() {
    return this.reclamationService.getAllReclamations();
  }
  
  @Post(':idPrestataire')
  @UseGuards(FirebaseAuthGuard)
  @UseInterceptors(FileInterceptor('pieceJointe'))
  async addReclamation(
    @Param('idPrestataire') idPrestataire: string,
    @Body() dto: CreateReclamationPrestataireDto,
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: RequestWithUser['user'],
  ) {
    // Gestion de l'upload Cloudinary
    if (file) {
      const result = await this.cloudinaryService.uploadImage(file);
      dto.pieceJointe = result.secure_url;
    } else {
      // Utiliser undefined au lieu de null
      dto.pieceJointe = undefined; 
    }

    // Associer l'ID du prestataire depuis le paramètre URL
    dto.prestataireId = idPrestataire;

    console.log('Payload reçu :', dto);
    return this.reclamationService.createReclamation(dto, user);
  }
    
}