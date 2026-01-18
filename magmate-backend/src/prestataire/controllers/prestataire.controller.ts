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
import { Prestataire, PrestataireStatus } from '../entities/prestataire.entity';

import { CreatePrestataireDto } from '../dto/create-prestataire.dto';
import { UpdatePrestataireDto } from '../dto/update-prestataire.dto';
import { PrestatairedetailsService } from '../services/prestatairedetails.service'; // Importez PrestatairedetailsService

@Controller('prestataires')
export class PrestataireController {
  constructor(
    private readonly prestataireService: PrestataireService,
    // Injectez PrestatairedetailsService ici
    private readonly prestataireDetailsService: PrestatairedetailsService,
  ) {}

  @Get('count')
  async getPrestataireCount(): Promise<number> {
    return this.prestataireService.getPrestataireCount();
  }

  @Get()
  findAll(
    @Query('ville') ville?: string,
    @Query('query') query?: string,
  ): Promise<Prestataire[]> {
    return this.prestataireService.findFiltered(ville, query);
  }

  @Get('is-prestataire')
  async isPrestataire(@Query('uuid') uuid: string) {
    try {
      const prestataire = await this.prestataireService.findByUuid(uuid);
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

  @Get('me')
  getMe(@Req() req: any) {
    return this.prestataireService.findByUserId(
      'f97b40ae-8106-4ada-9a34-d15881bb611b',
    );
  }

  @Get('me/:uuid')
  getMe2(@Param('uuid') uuid: string) {
    return this.prestataireService.findByUserId(uuid);
  }

  @Get('status/:status')
  async findByStatus(@Param('status') status: PrestataireStatus): Promise<Prestataire[]> {
    return this.prestataireService.findByStatus(status);
  }

  @Get(':idPrestataire') // Cette route doit maintenant utiliser le service de détails du prestataire
  async findByIdPrestataire(@Param('idPrestataire') idPrestataire: string): Promise<Prestataire> {
    // Utilisez prestataireDetailsService pour récupérer les détails par idPrestataire (clé primaire de l'entité Prestataire)
    return this.prestataireDetailsService.findById(idPrestataire);
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
    let userId = 'f1abb309-55ea-4574-8c2e-314dd77a83d9';
    return this.prestataireService.create(dto, userId);
  }

  @Post('create-with-uuid/:uuid')
  createWithUuid(
    @Param('uuid') uuid: string,
    @Body() dto: CreatePrestataireDto,
  ) {
    return this.prestataireService.create(dto, uuid);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePrestataireDto) {
    return this.prestataireService.update(id, dto);
  }

  @Delete(':id')
  async deletePrestataire(@Param('id') id: string): Promise<void> {
    return this.prestataireService.deletePrestataire(id);
  }

  @Patch(':idPrestataire/approve')
  async approvePrestataire(@Param('idPrestataire') idPrestataire: string): Promise<Prestataire> {
    return this.prestataireService.approvePrestataire(idPrestataire);
  }

  @Patch(':idPrestataire/reject')
  async rejectPrestataire(@Param('idPrestataire') idPrestataire: string): Promise<Prestataire> {
    return this.prestataireService.rejectPrestataire(idPrestataire);
  }

@Get('stats/by-status')
async getPrestataireCountByStatus() {
    return this.prestataireService.getPrestataireCountByStatus();
}
  @Get('stats/by-speciality')
  async getPrestataireCountBySpeciality(): Promise<{ speciality: string; count: number }[]> {
    return this.prestataireService.getPrestataireCountBySpeciality();
  }
}