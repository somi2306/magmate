import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prestataire, PrestataireStatus } from '../entities/prestataire.entity'; // Importez PrestataireStatus

import { CreatePrestataireDto } from '../dto/create-prestataire.dto';
import { UpdatePrestataireDto } from '../dto/update-prestataire.dto';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class PrestataireService {
  constructor(
    @InjectRepository(Prestataire)
    private readonly prestataireRepo: Repository<Prestataire>,
  ) {}

  async findFiltered(ville?: string, query?: string): Promise<Prestataire[]> {
    const qb = this.prestataireRepo
      .createQueryBuilder('prestataire')
      .leftJoinAndSelect('prestataire.utilisateur', 'utilisateur')
      .where('prestataire.estApprouve = :status', { status: PrestataireStatus.APPROVED }); // N'afficher que les approuvés par défaut

    if (ville && ville.trim() !== '') {
      qb.andWhere('LOWER(prestataire.ville) LIKE LOWER(:ville)', {
        ville: `%${ville}%`,
      });
    }

    if (query && query.trim() !== '') {
      qb.andWhere(
        `(LOWER(prestataire.specialite) LIKE LOWER(:query)
          OR LOWER(prestataire.ville) LIKE LOWER(:query)
          OR LOWER(utilisateur.fname) LIKE LOWER(:query)
          OR LOWER(utilisateur.lname) LIKE LOWER(:query)
          )`,
        { query: `%${query}%` },
      );
    }

    return qb.getMany();
  }

  async findByUuid(uuid: string): Promise<Prestataire> {
    const prestataire = await this.prestataireRepo.findOne({
      where: {
        utilisateur: {
          id: uuid,
        },
      },
      relations: ['utilisateur'], // important pour charger la relation
    });

    if (!prestataire) {
      throw new NotFoundException(`Prestataire avec l'UUID ${uuid} non trouvé`);
    }

    return prestataire;
  }

  async updateDisponibilite(
    id: string,
    disponibilite: boolean,
  ): Promise<Prestataire> {
    const prestataire = await this.prestataireRepo.findOneBy({
      idPrestataire: id,
    });
    if (!prestataire) throw new NotFoundException('Prestataire non trouvé');

    prestataire.disponibilite = disponibilite;
    return this.prestataireRepo.save(prestataire);
  }

  async create(dto: CreatePrestataireDto, userId: string) {
    const prestataire = this.prestataireRepo.create({
      ...dto,
      utilisateur: { id: userId } as User,
      estApprouve: PrestataireStatus.PENDING, // Définir le statut par défaut à PENDING
    });
    return this.prestataireRepo.save(prestataire);
  }

  async findByUserId(userId: string) {
    return this.prestataireRepo.findOne({
      where: { utilisateur: { id: userId } },
      relations: ['utilisateur'],
    });
  }

  async update(idPrestataire: string, dto: UpdatePrestataireDto) {
    const existing = await this.prestataireRepo.findOne({
      where: { idPrestataire: idPrestataire },
    });
    if (!existing) throw new NotFoundException('Prestataire introuvable');
    Object.assign(existing, dto);
    return this.prestataireRepo.save(existing);
  }

  async deletePrestataire(idPrestataire: string): Promise<void> {
    const prestataire = await this.prestataireRepo.findOne({
      where: { idPrestataire: idPrestataire },
    });

    if (!prestataire) {
      throw new NotFoundException('Prestataire non trouvé');
    }

    await this.prestataireRepo.remove(prestataire);
  }

  // Nouvelle méthode pour trouver les prestataires par statut
  async findByStatus(status: PrestataireStatus): Promise<Prestataire[]> {
    return this.prestataireRepo.find({
      where: { estApprouve: status },
      relations: ['utilisateur'],
      order: { utilisateur: { registrationDate: 'DESC' } } // Exemple d'ordre
    });
  }

  // Nouvelle méthode pour approuver un prestataire
  async approvePrestataire(idPrestataire: string): Promise<Prestataire> {
    const prestataire = await this.prestataireRepo.findOneBy({ idPrestataire });
    if (!prestataire) {
      throw new NotFoundException(`Prestataire avec l'ID ${idPrestataire} non trouvé`);
    }
    prestataire.estApprouve = PrestataireStatus.APPROVED;
    return this.prestataireRepo.save(prestataire);
  }

  // Nouvelle méthode pour rejeter un prestataire
  async rejectPrestataire(idPrestataire: string): Promise<Prestataire> {
    const prestataire = await this.prestataireRepo.findOneBy({ idPrestataire });
    if (!prestataire) {
      throw new NotFoundException(`Prestataire avec l'ID ${idPrestataire} non trouvé`);
    }
    prestataire.estApprouve = PrestataireStatus.REJECTED;
    return this.prestataireRepo.save(prestataire);
  }
}