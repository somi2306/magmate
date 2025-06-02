// bard/prestataire backend/services/commentprestataire.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'; //
import { InjectRepository } from '@nestjs/typeorm'; //
import { Repository } from 'typeorm'; //
import { avisprestataire } from '../entities/avisprestataire.entity'; //
import { CreateAvisDto } from '../dto/create-avis.dto'; //
import { User } from 'src/user/entities/user.entity'; //
import { Prestataire } from '../entities/prestataire.entity'; //

@Injectable()
export class CommentPrestataireService {
  constructor(
    @InjectRepository(avisprestataire)
    private readonly avisRepository: Repository<avisprestataire>, //

    @InjectRepository(User)
    private readonly userRepository: Repository<User>, //

    @InjectRepository(Prestataire)
    private readonly prestataireRepository: Repository<Prestataire>, //
  ) {}

  /**
   * Ajouter un avis pour un prestataire
   */
  async createAvis(createAvisDto: CreateAvisDto): Promise<avisprestataire> { //
    const { note, commentaire, prestataireId, userId } = createAvisDto; //

    const prestataire = await this.prestataireRepository.findOne({ //
      where: { idPrestataire: prestataireId },
    });

    if (!prestataire) {
      throw new NotFoundException(
        `Prestataire avec l'ID ${prestataireId} non trouvé`,
      );
    }

    const auteur = await this.userRepository.findOne({ //
      where: { id: userId },
    });

    if (!auteur) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
    }

    const newAvis = this.avisRepository.create({ //
      note,
      commentaire,
      date: new Date(),
      auteur,
      prestataire,
    });

    return await this.avisRepository.save(newAvis); //
  }

  /**
   * Récupérer les avis d'un prestataire
   */
  async getCommentsByPrestataire(
    prestataireId: string,
  ): Promise<avisprestataire[]> { //
    const prestataire = await this.prestataireRepository.findOne({ //
      where: { idPrestataire: prestataireId },
    });

    if (!prestataire) {
      throw new NotFoundException(
        `Prestataire avec l'ID ${prestataireId} non trouvé`,
      );
    }

    return this.avisRepository.find({ //
      where: { prestataire: { idPrestataire: prestataireId } },
      relations: ['auteur'],
      order: { date: 'DESC' },
    });
  }

  /**
   * Supprimer un commentaire par son ID
   * @param commentId L'ID du commentaire à supprimer
   */
  async deleteComment(commentId: string): Promise<void> {
    const result = await this.avisRepository.delete(commentId);
    if (result.affected === 0) {
      throw new NotFoundException(`Commentaire avec l'ID ${commentId} non trouvé.`);
    }
  }
}