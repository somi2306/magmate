// bard/marketplace backend/services/reclamation.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reclamation } from '../entities/reclamation.entity';
import { CreateReclamationDto } from '../dto/create-reclamation.dto';
import { Produit } from '../entities/produit.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ReclamationService {
  constructor(
    @InjectRepository(Reclamation)
    private readonly reclamationRepository: Repository<Reclamation>,
    @InjectRepository(Produit)
    private readonly produitRepository: Repository<Produit>,
    @InjectRepository(User)
    private readonly utilisateurRepository: Repository<User>
  ) {}

  // Créer une nouvelle réclamation
async createReclamation(dto: CreateReclamationDto, userEmail: string): Promise<Reclamation> {
    const produit = await this.produitRepository.findOne({ 
        where: { idProduit: dto.idCible } 
    });
    
    if (!produit) {
        throw new NotFoundException('Produit non trouvé');
    }

    const utilisateur = await this.utilisateurRepository.findOne({ 
        where: { email: userEmail } 
    });
    
    if (!utilisateur) {
        throw new NotFoundException('Utilisateur non trouvé');
    }

    const reclamation = this.reclamationRepository.create({
        description: dto.description,
        dateCreation: new Date(),
        pieceJointe: dto.pieceJointe,
        idCible: dto.idCible,
        produit: produit,
        utilisateur: utilisateur,
    });

    return this.reclamationRepository.save(reclamation);
}
  // Récupérer les réclamations d'un produit
  async getReclamationsByProductId(productId: number): Promise<Reclamation[]> {
    const product = await this.produitRepository.findOne({ where: { idProduit: productId } });

    if (!product) {
      throw new NotFoundException('Produit non trouvé');
    }

    // Récupérer les réclamations associées à ce produit
    return this.reclamationRepository.find({
      where: { produit: product },
      relations: ['utilisateur', 'produit'], // Charger les relations avec l'utilisateur et le produit
      order: { dateCreation: 'DESC' }, // Trier par date de création décroissante
    });
  }

  // NOUVELLE MÉTHODE : Récupérer toutes les réclamations
  async getAllReclamations(): Promise<Reclamation[]> {
    return this.reclamationRepository.find({
      relations: ['utilisateur', 'produit'], // Charger les relations pour afficher les infos
      order: { dateCreation: 'DESC' }, // Trier par date de création décroissante
    });
  }
}