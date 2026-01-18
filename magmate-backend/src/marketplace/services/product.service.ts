// src/marketplace/services/product.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produit } from '../entities/produit.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Produit)
    private readonly productRepository: Repository<Produit>,
  ) {}

  async getProductById(id: number): Promise<Produit | null> {
    return await this.productRepository.findOne({
      where: { idProduit: id },
      relations: ['images', 'magasin', 'magasin.proprietaire'],
    });
  }

  // Nouvelle méthode pour compter tous les produits
  async getProductCount(): Promise<number> {
    return await this.productRepository.count();
  }
}