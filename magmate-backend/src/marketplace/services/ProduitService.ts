// src/services/ProduitService.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produit } from '../entities/produit.entity';

@Injectable()
export class ProduitsService {
  constructor(
    @InjectRepository(Produit)
    private produitRepository: Repository<Produit>,
  ) {}

  async findAll(search?: string, ville?: string): Promise<Produit[]> {
    const queryBuilder = this.produitRepository
      .createQueryBuilder('produit')
      .leftJoin('produit.magasin', 'magasin');

    if (search) {
      const lowerSearch = `%${search.toLowerCase()}%`;
      queryBuilder.andWhere(
        '(LOWER(produit.titre) LIKE :search OR LOWER(produit.description) LIKE :search)',
        { search: lowerSearch },
      );
    }
    if (ville) {
      queryBuilder.andWhere('LOWER(magasin.ville) = :ville', {
        ville: ville.toLowerCase(),
      });
    }

    return queryBuilder.getMany();
  }

  // Méthode pour récupérer les produits par magasin
  async getProduitsByMagasin(magasinIdMagasin: number): Promise<Produit[]> {
    return this.produitRepository.find({
      where: { magasin: { idMagasin: magasinIdMagasin } }, // Relation avec magasin
    });
  }

    async getProductCount(): Promise<number> {
    return await this.produitRepository.count();
  }
}
