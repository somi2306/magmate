import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Magasin } from '../entities/magasin.entity';
import { Produit } from '../entities/produit.entity'; // Importer Produit

@Injectable()
export class MagasinService {
  constructor(
    @InjectRepository(Magasin)
    private magasinRepository: Repository<Magasin>,
    @InjectRepository(Produit) // Ajouter cette ligne pour injecter le repository des produits
    private produitRepository: Repository<Produit>,
  ) {}

  async findByUserId(userId: string): Promise<Magasin | null> {
    return this.magasinRepository.findOne({
      where: {
        proprietaire: { id: userId },
      },
      relations: ['proprietaire'],
    });
  }
  

  async deleteMagasin(id: number): Promise<void> {
    try {
      console.log('Suppression du magasin avec ID:', id);

      // Supprimer les produits associés au magasin
      const produitsSupprimes = await this.produitRepository.delete({
        magasin: { idMagasin: id }, // Utilisation du repository produit injecté
      });

      if (produitsSupprimes.affected === 0) {
        console.warn('Aucun produit trouvé pour le magasin avec ID:', id);
      } else {
        console.log('Produits supprimés:', produitsSupprimes.affected);
      }

      // Supprimer le magasin
      const result = await this.magasinRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`Magasin avec l'id ${id} non trouvé.`);
      }

      console.log(
        'Magasin supprimé avec succès. Résultat de la suppression:',
        result,
      );
    } catch (err) {
      console.error('Erreur dans deleteMagasin :', err);
      // Lancer une erreur 500 pour les problèmes internes du serveur
      throw new InternalServerErrorException(
        "Une erreur s'est produite lors de la suppression du magasin.",
      );
    }
  }

  // Nouvelle méthode pour compter tous les magasins
  async getMagasinCount(): Promise<number> {
    return await this.magasinRepository.count();
  }
}