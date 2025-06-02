import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Avis } from '../entities/avis.entity';
import { CreateAvisDto } from '../dto/create-avis.dto';
import { Produit } from '../entities/produit.entity';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Produit) private productRepository: Repository<Produit>,
    @InjectRepository(Avis) private readonly avisRepository: Repository<Avis>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  // Récupérer les commentaires pour un produit spécifique
  async getCommentsByProductId(productId: number): Promise<Avis[]> {
    const comments = await this.avisRepository.find({
      where: { produit: { idProduit: productId } },
      relations: ['auteur'], // Charger les informations de l'auteur (l'utilisateur)
      select: {
        auteur: {
          lname: true, // Charger uniquement le nom de l'auteur
          fname: true, // Charger uniquement le prénom de l'auteur
        },
      },
      order: { date: 'DESC' }, // Trier les avis par date décroissante
    });

    return comments;
  }

  async createComment(user: any, productId: number, createAvisDto: CreateAvisDto) {
  console.log('Email de l\'utilisateur:', user.email);  // Vérifier si l'email est récupéré correctement

  // Recherche de l'utilisateur par son email dans la base de données
  const foundUser = await this.userRepository.findOne({ where: { email: user.email } });

  if (!foundUser) {
    throw new Error('Utilisateur non trouvé avec cet email');
  }

  const product = await this.productRepository.findOne({ where: { idProduit: productId } });

  if (!product) {
    throw new Error('Produit non trouvé');
  }

  // Créer le nouveau commentaire avec l'utilisateur trouvé
  const newComment = this.avisRepository.create({
    note: createAvisDto.note,
    commentaire: createAvisDto.commentaire,
    date: new Date(),
    auteur: foundUser,  // Utiliser l'utilisateur trouvé par email
    produit: product, // Le produit concerné
  });

  console.log('Nouveau commentaire créé:', newComment);

  await this.avisRepository.save(newComment);

  // Retourner le commentaire ajouté avec les informations de l'auteur (prénom et nom)
  return {
    message: 'Commentaire ajouté avec succès',
    comment: {
      idAvis: newComment.idAvis,
      note: newComment.note,
      commentaire: newComment.commentaire,
      date: newComment.date,
      auteur: {
        fname: foundUser.fname,  // Prénom de l'auteur
        lname: foundUser.lname,  // Nom de l'auteur
      },
      produit: newComment.produit,  // Produit associé
    },
  };
  }

  // Nouvelle méthode pour supprimer un commentaire par son ID
  async deleteComment(commentId: number): Promise<void> {
    const result = await this.avisRepository.delete(commentId);
    if (result.affected === 0) {
      throw new NotFoundException(`Commentaire avec l'ID ${commentId} non trouvé.`);
    }
  }
}