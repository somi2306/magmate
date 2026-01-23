import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { MagasinService } from '../services/MagasinService';
import { ProductService } from '../services/product.service'; 
import { Magasin } from '../entities/magasin.entity';
import { Produit } from '../entities/produit.entity';

@Controller('magasins')
export class MagasinController {
  constructor(
    private readonly magasinService: MagasinService,
    // Injection du nouveau service
    private readonly productService: ProductService,
  ) {}

  @Get('count')
  async getMagasinCount(): Promise<number> {
    return await this.magasinService.getMagasinCount();
  }

  @Get('user/:userId')
  async getMagasinByUser(
    @Param('userId') userId: string,
  ): Promise<Magasin | null> {
    return this.magasinService.findByUserId(userId);
  }

  @Get(':magasinId/produits')
  async getProduitsByMagasin(
    @Param('magasinId', ParseIntPipe) magasinId: number,
  ): Promise<Produit[]> {
    // Utilisation de la méthode du service unifié
    return this.productService.getProduitsByMagasin(magasinId);
  }

  @Delete(':id')
  async deleteMagasin(@Param('id') id: number) {
    try {
      await this.magasinService.deleteMagasin(id);
      return {
        message: `Le magasin avec l'ID ${id} a été supprimé avec succès.`,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  @Get('uuid/:uuid')
  getByUuid(@Param('uuid') uuid: string) {
    return this.magasinService.findByUserId(uuid);
  }
}