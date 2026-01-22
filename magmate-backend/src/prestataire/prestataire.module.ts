import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrestataireController } from './controllers/prestataire.controller';
import { PrestataireService } from './services/prestataire.service';
import { Prestataire } from './entities/prestataire.entity';
import { PrestatairedetailsService } from './services/prestatairedetails.service';
import { PrestatairedetailsController } from './controllers/detailsprestataire.controller';
import { User } from 'src/user/entities/user.entity';
import { avisprestataire } from './entities/avisprestataire.entity';
import { CommentPrestataireService } from './services/commentprestataire.service';
import { CommentPrestataireController } from './controllers/commentprestataire.controller';
import { Reclamationprestataire } from './entities/reclamationprestataire.entity';
import { ReclamationPrestataireController } from './controllers/reclamationprestataire.controller';
import { ReclamationPrestataireService } from './services/reclamation-prestataire.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module'; // 1. Import

@Module({
  controllers: [
    ReclamationPrestataireController,
    PrestataireController,
    PrestatairedetailsController,
    CommentPrestataireController,
    
  ],
  providers: [
    PrestatairedetailsService,
    CommentPrestataireService,
    PrestataireService,
    ReclamationPrestataireService
  ],
  imports: [
    TypeOrmModule.forFeature([avisprestataire, Prestataire, User, Reclamationprestataire]),
    CloudinaryModule // 2. Ajout aux imports
  ],
  exports: [TypeOrmModule],
})
export class PrestataireModule {}