import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Image } from '../entities/image.entity';
import { Produit } from '../entities/produit.entity';
import { CreateImageDto } from '../dto/create-image.dto/create-image.dto';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepo: Repository<Image>,

    @InjectRepository(Produit)
    private readonly produitRepo: Repository<Produit>,
  ) {}

  async create(dto: CreateImageDto) {
    const produit = await this.produitRepo.findOneBy({
      idProduit: dto.produitId,
    });
    if (!produit) {
      throw new NotFoundException('Produit introuvable');
    }

    // Vérification que l'URL de l'image est bien définie et non vide
    if (!dto.imageURL || dto.imageURL.trim() === '') {
      throw new BadRequestException("L'URL de l'image est obligatoire");
    }

    const image = this.imageRepo.create({
      imageURL: dto.imageURL,
      produit, // Association du produit
    });

    return this.imageRepo.save(image); // Sauvegarde de l'image dans la base de données
  }

  findAll() {
    return this.imageRepo.find({ relations: ['produit'] }); // Récupérer toutes les images avec le produit associé
  }
}
