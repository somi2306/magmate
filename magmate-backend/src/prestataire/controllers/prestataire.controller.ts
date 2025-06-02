import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Query,
  Post,
  Put,
  Delete,
  Req,
} from '@nestjs/common';

import { PrestataireService } from '../services/prestataire.service';
import { Prestataire, PrestataireStatus } from '../entities/prestataire.entity'; // Importez PrestataireStatus

import { CreatePrestataireDto } from '../dto/create-prestataire.dto';
import { UpdatePrestataireDto } from '../dto/update-prestataire.dto';

@Controller('prestataires')
export class PrestataireController {
  constructor(private readonly prestataireService: PrestataireService) {}

  @Get()
  findAll(
    @Query('ville') ville?: string,
    @Query('query') query?: string,
  ): Promise<Prestataire[]> {
    // Cette route n'affichera que les approuvés par défaut via la modification dans le service
    return this.prestataireService.findFiltered(ville, query);
  }

  @Get('is-prestataire')
  async isPrestataire(@Query('uuid') uuid: string) {
    try {
      const prestataire = await this.prestataireService.findByUuid(uuid);
      // Un prestataire est considéré comme tel s'il existe et est approuvé
      return prestataire.estApprouve === PrestataireStatus.APPROVED;
    } catch (error) {
      if (error instanceof NotFoundException) {
        return false;
      }
      throw error;
    }
  }

  @Get('uuid/:uuid')
  getByUuid(@Param('uuid') uuid: string) {
    return this.prestataireService.findByUserId(uuid);
  }

  @Get(':idPrestataire') // Utilisation du paramètre ID dans l'URL pour les détails (peut être UUID)
  async findByIdPrestataire(@Param('idPrestataire') idPrestataire: string): Promise<Prestataire> {
    // Cette route est pour les détails d'un prestataire, elle devrait utiliser findById du service PrestatairedetailsService
    // Cependant, comme vous avez déjà une route getByUuid, assurez-vous de la cohérence.
    // Si ':idPrestataire' est toujours l'UUID, alors findByUuid est approprié ici.
    return this.prestataireService.findByUuid(idPrestataire);
  }

  @Patch(':id/disponibilite')
  updateDisponibilite(
    @Param('id') id: string,
    @Body('disponibilite') disponibilite: boolean,
  ) {
    return this.prestataireService.updateDisponibilite(id, disponibilite);
  }

  @Post()
  create(@Body() dto: CreatePrestataireDto, @Req() req: any) {
    let userId = 'f1abb309-55ea-4574-8c2e-314dd77a83d9'; // Remplacez par l'ID utilisateur réel si disponible via auth
    return this.prestataireService.create(dto, userId);
  }

  @Post('create-with-uuid/:uuid')
  createWithUuid(
    @Param('uuid') uuid: string,
    @Body() dto: CreatePrestataireDto,
  ) {
    return this.prestataireService.create(dto, uuid);
  }

  @Get('me') // Endpoint pour récupérer le profil du prestataire connecté
  getMe(@Req() req: any) {
    // Utiliser l'UUID de l'utilisateur connecté
    // Remplacez 'f97b40ae-8106-4ada-9a34-d15881bb611b' par req.user.uuid ou un mécanisme similaire
    return this.prestataireService.findByUserId(
      'f97b40ae-8106-4ada-9a34-d15881bb611b',
    );
  }

  @Get('me/:uuid') // Endpoint pour récupérer le profil du prestataire par UUID
  getMe2(@Param('uuid') uuid: string) {
    return this.prestataireService.findByUserId(uuid);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePrestataireDto) {
    return this.prestataireService.update(id, dto);
  }

  @Delete(':id')
  async deletePrestataire(@Param('id') id: string): Promise<void> {
    return this.prestataireService.deletePrestataire(id);
  }

  // Nouvelles routes pour la gestion des statuts
  @Get('status/:status')
  async findByStatus(@Param('status') status: PrestataireStatus): Promise<Prestataire[]> {
    return this.prestataireService.findByStatus(status);
  }

  @Patch(':idPrestataire/approve')
  async approvePrestataire(@Param('idPrestataire') idPrestataire: string): Promise<Prestataire> {
    return this.prestataireService.approvePrestataire(idPrestataire);
  }

  @Patch(':idPrestataire/reject')
  async rejectPrestataire(@Param('idPrestataire') idPrestataire: string): Promise<Prestataire> {
    return this.prestataireService.rejectPrestataire(idPrestataire);
  }
}