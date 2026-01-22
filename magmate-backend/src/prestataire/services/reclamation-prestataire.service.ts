import {
    Injectable,
    NotFoundException,
    InternalServerErrorException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { Reclamationprestataire } from '../entities/reclamationprestataire.entity';
  import { CreateReclamationPrestataireDto } from '../dto/create-reclamation-prestataire.dto';
  import { User } from 'src/user/entities/user.entity';
  import { Prestataire } from '../entities/prestataire.entity';
  
  @Injectable()
  export class ReclamationPrestataireService {
    constructor(
      @InjectRepository(Reclamationprestataire)
      private readonly reclamationRepo: Repository<Reclamationprestataire>,
  
      @InjectRepository(User)
      private readonly userRepository: Repository<User>,
  
      @InjectRepository(Prestataire)
      private readonly prestataireRepository: Repository<Prestataire>,
    ) {}

       async getAllReclamations(): Promise<Reclamationprestataire[]> {
    return this.reclamationRepo.find({
      // On charge l'auteur de la réclamation et le prestataire (avec ses infos utilisateur)
      relations: ['utilisateur', 'prestataire', 'prestataire.utilisateur'],
      // Tri par date décroissante pour voir les plus récentes en premier
      order: { date: 'DESC' },
    });
  }
  
    /**
     * Créer une réclamation pour un prestataire
     */
    async createReclamation(dto: CreateReclamationPrestataireDto, user: { email: string }): Promise<Reclamationprestataire> {
      const utilisateur = await this.userRepository.findOne({ where: { email: user.email } });
      if (!utilisateur) {
        throw new NotFoundException('Utilisateur non trouvé');
      }
  
      const prestataire = await this.prestataireRepository.findOne({ where: { idPrestataire: dto.prestataireId } });
      if (!prestataire) {
        throw new NotFoundException('Prestataire non trouvé');
      }
  
      const newReclamation = this.reclamationRepo.create({
        description: dto.description,
        pieceJointe: dto.pieceJointe || null,
        prestataire: prestataire,
        utilisateur: utilisateur,
        date: new Date(),
      });
  
      try {
        return await this.reclamationRepo.save(newReclamation);
      } catch (error) {
        throw new InternalServerErrorException('Erreur lors de la création de la réclamation');
      }
    }
 
  }
  