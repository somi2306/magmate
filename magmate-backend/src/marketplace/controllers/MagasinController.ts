import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Delete, // Ajouter le décorateur Delete
  HttpException,
  HttpStatus, // Importer HttpStatus
} from '@nestjs/common';
import { MagasinService } from '../services/MagasinService';
import { ProduitsService } from '../services/ProduitService';
import { Magasin } from '../entities/magasin.entity';
import { Produit } from '../entities/produit.entity';

@Controller('magasins')
export class MagasinController {
  constructor(
    private readonly magasinService: MagasinService,
    private readonly produitsService: ProduitsService,
  ) {}

  // Nouvelle route pour récupérer le nombre total de magasins
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

  // Récupérer les produits par magasin
  @Get(':magasinId/produits')
  async getProduitsByMagasin(
    @Param('magasinId', ParseIntPipe) magasinId: number,
  ): Promise<Produit[]> {
    return this.produitsService.getProduitsByMagasin(magasinId);
  }

  @Delete(':id') // Ajouter le décorateur @Delete pour la suppression
  async deleteMagasin(@Param('id') id: number) {
    try {
      await this.magasinService.deleteMagasin(id);
      return {
        message: `Le magasin avec l'ID ${id} a été supprimé avec succès.`,
      };
    } catch (error) {
      // Si une exception est levée, on la gère ici
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Get('uuid/:uuid')
  getByUuid(@Param('uuid') uuid: string) {
    return this.magasinService.findByUserId(uuid);
  }
}