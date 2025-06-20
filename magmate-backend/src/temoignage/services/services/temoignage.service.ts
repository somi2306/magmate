// bard app/src backend/temoignage/services/services/temoignage.service.ts
import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Temoignage } from '../../entities/temoignage.entity';
import { CreateTemoignageDto } from '../../dto/create-temoignage.dto';
import { User } from '../../../user/entities/user.entity';

@Injectable()
export class TemoignageService {
  constructor(
    @InjectRepository(Temoignage)
    private readonly temoignageRepository: Repository<Temoignage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // userId is now a separate parameter
  async createTemoignage(createTemoignageDto: CreateTemoignageDto, userId: string): Promise<Temoignage> {
    const { commentaire, note } = createTemoignageDto; // userId is no longer destructured from dto

    const auteur = await this.userRepository.findOne({ where: { id: userId } });
    if (!auteur) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé.`);
    }

    const nouveauTemoignage = this.temoignageRepository.create({
      commentaire,
      note,
      auteur,
      dateCreation: new Date(),
    });

    try {
      return await this.temoignageRepository.save(nouveauTemoignage);
    } catch (error) {
      throw new InternalServerErrorException('Erreur lors de la création du témoignage.');
    }
  }

  async findAllTemoignages(): Promise<Temoignage[]> {
    return this.temoignageRepository.find({ relations: ['auteur'], order: { dateCreation: 'DESC' } });
  }

  async deleteTemoignage(idTemoignage: string): Promise<void> {
    const result = await this.temoignageRepository.delete(idTemoignage);
    if (result.affected === 0) {
      throw new NotFoundException(`Témoignage avec l'ID ${idTemoignage} non trouvé.`);
    }
  }
}