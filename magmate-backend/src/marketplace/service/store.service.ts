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

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Magasin)
    private magasinRepository: Repository<Magasin>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async checkUserExistence(proprietaireId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id: proprietaireId },
    });
  }

  async create(dto: CreateMagasinDto) {
    const user = await this.userRepository.findOne({
      where: { id: dto.proprietaireId },
    });
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    const magasin = this.magasinRepository.create(dto);
    magasin.proprietaire = user;
    magasin.dateCreation = new Date();
    magasin.estApprouve = MagasinStatus.PENDING;
    try {
      return await this.magasinRepository.save(magasin);
    } catch (error) {
      console.error('Erreur lors de la création du magasin:', error);
      throw new InternalServerErrorException(
        'Erreur interne lors de la création du magasin',
      );
    }
  }

  async findAll(estApprouve?: MagasinStatus) {
    try {
      if (estApprouve) {
        return await this.magasinRepository.find({ where: { estApprouve } });
      }
      return await this.magasinRepository.find();
    } catch (error) {
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des magasins',
      );
    }
  }

  async findOne(idMagasin: number) {
    try {
      const magasin = await this.magasinRepository.findOne({
        where: { idMagasin: idMagasin },
        relations: ['proprietaire'],
      });

      if (!magasin) {
        throw new NotFoundException(
          `Magasin avec l'ID ${idMagasin} non trouvé`,
        );
      }

      return magasin;
    } catch (error) {
      throw new InternalServerErrorException(
        `Erreur lors de la récupération du magasin avec l'ID ${idMagasin}`,
      );
    }
  }

  async update(idMagasin: number, dto: UpdateMagasinDto) {
    const magasin = await this.magasinRepository.findOne({
      where: { idMagasin: idMagasin },
    });

    if (!magasin) {
      throw new NotFoundException(`Magasin avec l'ID ${idMagasin} non trouvé`);
    }

    Object.assign(magasin, dto);

    try {
      return await this.magasinRepository.save(magasin);
    } catch (error) {
      throw new InternalServerErrorException(
        'Erreur lors de la mise à jour du magasin',
      );
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
      throw new InternalServerErrorException(
        'Erreur lors de la suppression du magasin',
      );
    }
  }

  async approveStore(idMagasin: number) {
    const magasin = await this.magasinRepository.findOne({
      where: { idMagasin: idMagasin },
    });

    if (!magasin) {
      throw new NotFoundException(`Magasin avec l'ID ${idMagasin} non trouvé`);
    }

    magasin.estApprouve = MagasinStatus.APPROVED;
    try {
      return await this.magasinRepository.save(magasin);
    } catch (error) {
      throw new InternalServerErrorException(
        "Erreur lors de l'approbation du magasin",
      );
    }
  }

  async rejectStore(idMagasin: number) {
    const magasin = await this.magasinRepository.findOne({
      where: { idMagasin: idMagasin },
    });

    if (!magasin) {
      throw new NotFoundException(`Magasin avec l'ID ${idMagasin} non trouvé`);
    }

    magasin.estApprouve = MagasinStatus.REJECTED;
    try {
      return await this.magasinRepository.save(magasin);
    } catch (error) {
      throw new InternalServerErrorException(
        'Erreur lors du refus du magasin',
      );
    }
  }

  // Dans store.service.ts
async findByStatus(estApprouve: MagasinStatus) {
  try {
    return await this.magasinRepository.find({ 
      where: { estApprouve },
      relations: ['proprietaire'] 
    });
  } catch (error) {
    throw new InternalServerErrorException(
      `Erreur lors de la récupération des magasins ${estApprouve}`,
    );
  }
}
}