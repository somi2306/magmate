import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

// Plus besoin de 'fs' ni 'path'

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getProfileByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return {
      id: user.id,
      email: user.email,
      fname: user.fname,
      lname: user.lname,
      photo: user.photo,
    };
  }

  // Modification de la signature : on attend une string (URL) et non plus un File
  async updateProfilePhoto(email: string, photoUrl: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    // Note : Si vous souhaitez supprimer l'ancienne image de Cloudinary,
    // il faudrait stocker le "public_id" de l'image Cloudinary.
    // Pour l'instant, on se contente de remplacer l'URL.

    user.photo = photoUrl; // Mise à jour avec l'URL Cloudinary

    await this.userRepository.save(user);

    return {
      message: 'Photo de profil mise à jour avec succès',
      photo: user.photo,
    };
  }
}