import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produit } from '../entities/produit.entity';
import { CreateProduitDto } from '../dto/create-produit.dto/create-produit.dto';
import { UpdateProduitDto } from '../dto/update-produit.dto/update-produit.dto';
import { Magasin } from '../entities/magasin.entity';
import { Image } from '../entities/image.entity';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Produit)
    private readonly produitRepository: Repository<Produit>,

    @InjectRepository(Magasin)
    private readonly magasinRepository: Repository<Magasin>,

    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  // --- Helper Cloudinary ---
  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'produits' },
        (error: any, result?: UploadApiResponse) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload failed: No result'));
          resolve(result.secure_url);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  // --- CREATE ---
  async create(
    dto: CreateProduitDto, 
    mainImageFile?: Express.Multer.File, 
    galleryFiles?: Express.Multer.File[]
  ) {
    const produit = new Produit();
    produit.titre = dto.titre;
    produit.description = dto.description;
    produit.prix = dto.prix;
    produit.dateAjout = new Date();

    // 1. Upload Image Principale
    if (mainImageFile) {
      try {
        produit.imagePrincipale = await this.uploadToCloudinary(mainImageFile);
      } catch (err) {
        throw new InternalServerErrorException("Erreur upload image principale");
      }
    } else {
        produit.imagePrincipale = dto.imagePrincipale || '';
    }

    // 2. Lier le Magasin
    if (dto.magasinIdMagasin) {
      const magasin = await this.magasinRepository.findOneBy({
        idMagasin: dto.magasinIdMagasin,
      });
      if (!magasin) throw new NotFoundException('Magasin introuvable');
      produit.magasin = magasin;
    }

    const savedProduit = await this.produitRepository.save(produit);

    // 3. Gestion Galerie d'images
    if (galleryFiles && galleryFiles.length > 0) {
      const uploadPromises = galleryFiles.map(file => this.uploadToCloudinary(file));
      const urls = await Promise.all(uploadPromises);

      const imagesEntities = urls.map(url => {
        const img = new Image();
        img.imageURL = url;
        img.produit = savedProduit;
        return img;
      });
      await this.imageRepository.save(imagesEntities);
    }

    return savedProduit;
  }

  // --- READ ---
  async findAll(search?: string, ville?: string): Promise<Produit[]> {
    const queryBuilder = this.produitRepository
      .createQueryBuilder('produit')
      .leftJoinAndSelect('produit.magasin', 'magasin');

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

  async findOne(id: number): Promise<Produit | null> {
    return this.produitRepository.findOne({
      where: { idProduit: id },
      relations: ['images', 'magasin', 'magasin.proprietaire'],
    });
  }

  // Alias pour garder la compatibilité
  async getProductById(id: number) {
      return this.findOne(id);
  }

  async getProductCount(): Promise<number> {
    return await this.produitRepository.count();
  }

  // Méthode requise par MagasinController
  async getProduitsByMagasin(magasinId: number): Promise<Produit[]> {
    return this.produitRepository.find({
      where: { magasin: { idMagasin: magasinId } },
      relations: ['images'],
    });
  }

  // --- UPDATE ---
  async update(
    id: number, 
    dto: UpdateProduitDto, 
    mainImageFile?: Express.Multer.File, 
    galleryFiles?: Express.Multer.File[]
  ) {
    return this.produitRepository.manager.transaction(async (manager) => {
      const produit = await manager.findOne(Produit, {
        where: { idProduit: id },
      });

      if (!produit) throw new NotFoundException('Produit introuvable');

      produit.titre = dto.titre ?? produit.titre;
      produit.description = dto.description ?? produit.description;
      produit.prix = dto.prix ?? produit.prix;

      if (mainImageFile) {
         produit.imagePrincipale = await this.uploadToCloudinary(mainImageFile);
      }

      await manager.save(produit);

      if (galleryFiles && galleryFiles.length > 0) {
        const uploadPromises = galleryFiles.map(file => this.uploadToCloudinary(file));
        const urls = await Promise.all(uploadPromises);

        const  sImages = urls.map((url) => {
            const image = new Image();
            image.imageURL = url;
            image.produit = produit;
            return image;
          });

        await manager.save(Image,  sImages);
      }

      return manager.findOne(Produit, {
        where: { idProduit: id },
        relations: ['images', 'magasin'],
      });
    });
  }

  // --- DELETE ---
  async remove(id: number) {
    const produit = await this.produitRepository.findOne({
      where: { idProduit: id },
      relations: ['images'],
    });

    if (!produit) throw new NotFoundException('Produit introuvable');

    if (produit.images && produit.images.length > 0) {
        await this.imageRepository.remove(produit.images);
    }
    await this.produitRepository.remove(produit);

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