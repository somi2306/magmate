import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Magasin, MagasinStatus } from '../entities/magasin.entity';
import { CreateMagasinDto } from '../dto/create-magasin.dto/create-magasin.dto';
import { UpdateMagasinDto } from '../dto/update-magasin.dto/update-magasin.dto';
import { User } from 'src/user/entities/user.entity';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Magasin)
    private magasinRepository: Repository<Magasin>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'magasins' },
        (error: any, result?: UploadApiResponse) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload failed'));
          resolve(result.secure_url);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async checkUserExistence(proprietaireId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: proprietaireId },
    });
  }

  async create(dto: CreateMagasinDto, file?: Express.Multer.File) {
    const user = await this.userRepository.findOne({
      where: { id: dto.proprietaireId },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    let imageUrl = dto.image; 
    if (file) {
      try {
        imageUrl = await this.uploadToCloudinary(file);
      } catch (error) {
        throw new InternalServerErrorException("Erreur lors de l'upload de l'image");
      }
    }

    const magasin = this.magasinRepository.create({
      ...dto,
      image: imageUrl,
    });

    magasin.proprietaire = user;
    magasin.dateCreation = new Date();
    magasin.estApprouve = MagasinStatus.PENDING;

    try {
      return await this.magasinRepository.save(magasin);
    } catch (error) {
      console.error('Erreur creation magasin:', error);
      throw new InternalServerErrorException('Erreur interne création magasin');
    }
  }

  async findAll(estApprouve?: MagasinStatus) {
    try {
      if (estApprouve) {
        return await this.magasinRepository.find({ where: { estApprouve }, relations: ['proprietaire'] });
      }
      return await this.magasinRepository.find({ relations: ['proprietaire'] });
    } catch (error) {
      throw new InternalServerErrorException('Erreur récupération magasins');
    }
  }

  async findOne(idMagasin: number) {
    try {
      const magasin = await this.magasinRepository.findOne({
        where: { idMagasin: idMagasin },
        relations: ['proprietaire'],
      });

      if (!magasin) {
        throw new NotFoundException(`Magasin avec l'ID ${idMagasin} non trouvé`);
      }
      return magasin;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(`Erreur récupération magasin ${idMagasin}`);
    }
  }

  async update(idMagasin: number, dto: UpdateMagasinDto, file?: Express.Multer.File) {
    const magasin = await this.magasinRepository.findOne({
      where: { idMagasin: idMagasin },
    });

    if (!magasin) {
      throw new NotFoundException(`Magasin avec l'ID ${idMagasin} non trouvé`);
    }

    if (file) {
        try {
            const imageUrl = await this.uploadToCloudinary(file);
            magasin.image = imageUrl;
        } catch (error) {
            throw new InternalServerErrorException("Erreur upload image update");
        }
    }

    Object.assign(magasin, dto);

    try {
      return await this.magasinRepository.save(magasin);
    } catch (error) {
      throw new InternalServerErrorException('Erreur mise à jour magasin');
    }
  }

  async remove(idMagasin: number) {
    const magasin = await this.magasinRepository.findOne({
      where: { idMagasin: idMagasin },
    });

    if (!magasin) {
      throw new NotFoundException(`Magasin avec l'ID ${idMagasin} non trouvé`);
    }

    try {
      await this.magasinRepository.delete(idMagasin);
      return { message: 'Magasin supprimé avec succès' };
    } catch (error) {
      throw new InternalServerErrorException('Erreur suppression magasin');
    }
  }

  async approveStore(idMagasin: number) {
    const magasin = await this.findOne(idMagasin);
    magasin.estApprouve = MagasinStatus.APPROVED;
    return await this.magasinRepository.save(magasin);
  }

  async rejectStore(idMagasin: number) {
    const magasin = await this.findOne(idMagasin);
    magasin.estApprouve = MagasinStatus.REJECTED;
    return await this.magasinRepository.save(magasin);
  }

  async findByStatus(estApprouve: MagasinStatus) {
    try {
      return await this.magasinRepository.find({ 
        where: { estApprouve },
        relations: ['proprietaire'] 
      });
    } catch (error) {
      throw new InternalServerErrorException('Erreur récupération par statut');
    }
  }

  async getMagasinCountByStatus(): Promise<{ estApprouve: MagasinStatus; count: number }[]> {
      return this.magasinRepository
          .createQueryBuilder('magasin')
          .select('magasin.estApprouve', 'estApprouve')
          .addSelect('COUNT(magasin.idMagasin)', 'count')
          .groupBy('magasin.estApprouve')
          .getRawMany();
  }
}