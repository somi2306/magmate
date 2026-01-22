import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reclamation } from '../entities/reclamation.entity';
import { CreateReclamationDto } from '../dto/create-reclamation.dto';
import { Produit } from '../entities/produit.entity';
import { User } from 'src/user/entities/user.entity';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
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

  // --- Helper Cloudinary (identique au service produit) ---
  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'reclamations' },
        (error: any, result?: UploadApiResponse) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload failed'));
          resolve(result.secure_url);
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  // --- Créer une nouvelle réclamation ---
  async createReclamation(
    dto: CreateReclamationDto, 
    userEmail: string, 
    file?: Express.Multer.File // Ajout du paramètre file
  ): Promise<Reclamation> {
    const produit = await this.produitRepository.findOne({ 
        where: { idProduit: dto.idCible } 
    });
    
    if (!produit) throw new NotFoundException('Produit non trouvé');

    const utilisateur = await this.utilisateurRepository.findOne({ 
        where: { email: userEmail } 
    });
    
    if (!utilisateur) throw new NotFoundException('Utilisateur non trouvé');

    // Upload vers Cloudinary si un fichier est présent
    let pieceJointeUrl = '';
    if (file) {
      try {
        pieceJointeUrl = await this.uploadToCloudinary(file);
      } catch (err) {
        throw new InternalServerErrorException("Erreur upload pièce jointe");
      }
    }

    const reclamation = this.reclamationRepository.create({
        description: dto.description,
        dateCreation: new Date(),
        pieceJointe: pieceJointeUrl, // On stocke l'URL Cloudinary complète
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