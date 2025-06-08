import { Controller, Get, Query } from '@nestjs/common';
import { ProduitsService } from '../services/ProduitService'; // Assurez-vous que c'est bien ProduitsService qui est utilisé
import { ProductService } from '../services/product.service'; // Importer ProductService pour le count
import { Produit } from '../entities/produit.entity';

@Controller('produits')
export class ProduitsController {
  constructor(
    private readonly produitsService: ProduitsService,
    private readonly productService: ProductService, // Injecter ProductService
  ) {}

  // Nouvelle route pour récupérer le nombre total de produits
  @Get('count')
  async getProductCount(): Promise<number> {
    return await this.productService.getProductCount();
  }

  @Get()
  async getProduits(
    @Query('search') search?: string,
    @Query('ville') ville?: string,
  ): Promise<Produit[]> {
    return this.produitsService.findAll(search, ville);
  }
}