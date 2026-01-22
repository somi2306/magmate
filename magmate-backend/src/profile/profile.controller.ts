import {
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service'; // Import service

@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly cloudinaryService: CloudinaryService // Injection
  ) {}

  @UseGuards(FirebaseAuthGuard)
  @Get()
  async getProfile(@GetUser() user: any) {
    return this.profileService.getProfileByEmail(user.email);
  }

  @UseGuards(FirebaseAuthGuard)
  @Patch('update-photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      // On garde uniquement le filtre pour valider le type de fichier
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|jpg)$/)) {
          return callback(
            new BadRequestException('Seuls les fichiers JPG, JPEG et PNG sont autorisés'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // Limite à 5MB par exemple
      },
    }),
  )
  async updatePhoto(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: any,
  ) {
    if (!file) {
        throw new BadRequestException('Aucun fichier fourni');
    }

    // 1. Envoi du fichier vers Cloudinary
    const result = await this.cloudinaryService.uploadImage(file);

    // 2. On passe l'URL sécurisée au service (au lieu du fichier physique)
    return this.profileService.updateProfilePhoto(user.email, result.secure_url);
  }
}