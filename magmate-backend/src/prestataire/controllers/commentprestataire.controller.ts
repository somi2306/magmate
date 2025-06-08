
import { Controller, Post, Get, Param, Body, Delete } from '@nestjs/common'; // Importer Delete
import { CommentPrestataireService } from '../services/commentprestataire.service'; //
import { CreateAvisDto } from '../dto/create-avis.dto'; //

@Controller('prestataires/comments') //
export class CommentPrestataireController {
  constructor(
    private readonly commentPrestataireService: CommentPrestataireService, //
  ) {}

  /**
   * Créer un avis pour un prestataire
   * POST /prestataires/comments
   */
  @Post()
  async createAvis(@Body() createAvisDto: CreateAvisDto) { //
    return this.commentPrestataireService.createAvis(createAvisDto); //
  }

  /**
   * Récupérer les avis d'un prestataire
   * GET /prestataires/comments/:prestataireId
   */
  @Get(':prestataireId')
  async getComments(@Param('prestataireId') prestataireId: string) { //
    return this.commentPrestataireService.getCommentsByPrestataire(
      prestataireId, //
    );
  }

  /**
   * Supprimer un commentaire par son ID
   * DELETE /prestataires/comments/:commentId
   */
  @Delete(':commentId')
  async deleteComment(@Param('commentId') commentId: string) {
    await this.commentPrestataireService.deleteComment(commentId);
    return { message: `Commentaire avec l'ID ${commentId} supprimé avec succès.` };
  }
}