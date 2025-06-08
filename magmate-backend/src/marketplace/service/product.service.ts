import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produit } from '../entities/produit.entity';
import { CreateProduitDto } from '../dto/create-produit.dto/create-produit.dto';
import { UpdateProduitDto } from '../dto/update-produit.dto/update-produit.dto';
import { Magasin } from '../entities/magasin.entity';
import { Image } from '../entities/image.entity';
import { log } from 'console';

@Injectable()
export class ProduitService {
  constructor(
    @InjectRepository(Produit)
    private produitRepository: Repository<Produit>,

    @InjectRepository(Magasin)
    private magasinRepository: Repository<Magasin>,

    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
  ) {}

  async create(dto: CreateProduitDto) {
    const produit = new Produit();
    produit.titre = dto.titre;
    produit.description = dto.description;
    produit.prix = dto.prix;
    produit.imagePrincipale = dto.imagePrincipale;
    produit.dateAjout = new Date();

    console.log(`magasin id : ${dto.magasinIdMagasin}`);

    if (dto.magasinIdMagasin) {
      const magasin = await this.magasinRepository.findOneBy({
        idMagasin: dto.magasinIdMagasin,
      });

      if (!magasin) {
        throw new Error('Magasin introuvable');
      }

      console.log(`Found magasin: ${magasin.nom}`);
      produit.magasin = magasin;
    }

    const savedProduit = await this.produitRepository.save(produit);

    if (dto.images && dto.images.length > 0) {
      const images = dto.images.map((imageURL) => {
        const image = new Image();
        image.imageURL = imageURL;
        image.produit = savedProduit;
        return image;
      });

      await this.imageRepository.save(images);
    } else {
      console.log('No images provided or image array is empty');
    }

    return savedProduit;
  }

  findAll() {
    return this.produitRepository.find({ relations: ['magasin'] });
  }

  findOne(id: number) {
    return this.produitRepository.findOne({
      where: { idProduit: id },
      relations: ['magasin', 'images'],
    });
  }
  async update(id: number, dto: UpdateProduitDto) {
    return this.produitRepository.manager.transaction(async (manager) => {
      // 1. Charge le produit (sans images pour éviter les conflits)
      const produit = await manager.findOne(Produit, {
        where: { idProduit: id },
      });

      if (!produit) throw new NotFoundException('Produit introuvable');

      // 2. Met à jour TOUS les champs modifiables
      produit.titre = dto.titre ?? produit.titre; // Garde l'ancienne valeur si non fournie
      produit.description = dto.description ?? produit.description;
      produit.prix = dto.prix ?? produit.prix;
      produit.imagePrincipale = dto.imagePrincipale ?? produit.imagePrincipale;

      // 3. Sauvegarde EXPLICITE des modifications du produit
      await manager.save(produit); 

      // 4. Gestion des images
      if (dto.images) {
        // Supprime les anciennes images
        await manager.delete(Image, { produit: { idProduit: id } });

        // Crée les nouvelles images
        const nouvellesImages = dto.images
          .filter((img) => img?.trim())
          .map((filename) => {
            const image = new Image();
            image.imageURL = filename;
            image.produit = produit;
            return image;
          });

        await manager.save(Image, nouvellesImages);
      }

      // 5. Retourne le produit COMPLET avec ses images
      return manager.findOne(Produit, {
        where: { idProduit: id },
        relations: ['images', 'magasin'], // ⚠️ Ajoutez toutes les relations nécessaires
      });
    });
  }
  // Modification de la méthode remove
  async remove(id: number) {
    const produit = await this.produitRepository.findOne({
      where: { idProduit: id },
      relations: ['images'], // Charger les images associées au produit
    });

    if (!produit) {
      throw new Error('Produit introuvable');
    }

    // Supprimer les images associées au produit
    if (produit.images && produit.images.length > 0) {
      await this.imageRepository.delete({ produit: produit }); // Supprimer les images liées
    }

    // Supprimer le produit
    await this.produitRepository.remove(produit); // Supprimer le produit de la base de données

    return { message: 'Produit supprimé avec succès' };
  }

    async getProductCountByStore(): Promise<{ storeName: string; productCount: number }[]> {
    return this.produitRepository
      .createQueryBuilder('produit')
      .select('magasin.nom', 'storeName')
      .addSelect('COUNT(produit.idProduit)', 'productCount')
      .leftJoin('produit.magasin', 'magasin')
      .groupBy('magasin.nom')
      .getRawMany();
  }
}
