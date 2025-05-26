import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ReclamationService } from '../services/reclamation.service';
import { CreateReclamationDto } from '../dto/create-reclamation.dto';
import { FirebaseAuthGuard } from 'src/auth/firebase-auth.guard'; // Guard pour authentification Firebase
import { GetUser } from 'src/common/decorators/get-user.decorator'; // Décorateur pour récupérer l'utilisateur
import { RequestWithUser } from 'src/common/interfaces/request-with-user.interface'; // Interface pour l'utilisateur authentifié

@Controller('reclamations')
export class ReclamationController {
  constructor(private readonly reclamationService: ReclamationService) {}

  // Route pour récupérer toutes les réclamations d'un produit
  @Get(':productId')
  async getReclamations(@Param('productId') productId: number) {
    return this.reclamationService.getReclamationsByProductId(productId);
  }

  // Route pour ajouter une réclamation à un produit
 @Post(':productId')
@UseGuards(FirebaseAuthGuard)
async addReclamation(
    @Param('productId') productId: number,
    @Body() createReclamationDto: CreateReclamationDto,
    @GetUser() user: RequestWithUser['user']
) {
    // Utilisez l'email de l'utilisateur authentifié plutôt que celui du DTO
    createReclamationDto.idCible = productId;
    
    return this.reclamationService.createReclamation(
        createReclamationDto, 
        user.email
    );
}
}
