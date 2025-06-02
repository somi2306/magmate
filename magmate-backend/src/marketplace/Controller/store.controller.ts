// marketplace backend/Controller/store.controller.ts
import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  Delete,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  NotFoundException,
  Patch,
  Query, // Import Query
} from '@nestjs/common';
import { StoreService } from '../service/store.service';
import { CreateMagasinDto } from '../dto/create-magasin.dto/create-magasin.dto';
import { UpdateMagasinDto } from '../dto/update-magasin.dto/update-magasin.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from 'src/config/multer.config';
import { User } from 'src/user/entities/user.entity';
import { MagasinStatus } from '../entities/magasin.entity'; // Importer l'enum

@ApiTags('magasins')
@Controller('magasins')
export class StoreController {
  constructor(private readonly magasinService: StoreService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor(multerOptions))
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() formData: any,
  ) {
    console.log('FormData reçu:', formData);
    console.log('Fichiers reçus:', files);

    const dto: CreateMagasinDto = {
      nom: formData.nom,
      description: formData.description,
      localisation: formData.localisation,
      horaire: formData.horaire,
      telephone: formData.telephone,
      ville: formData.ville,
      proprietaireId: formData.proprietaireId,
      image: files?.[0]?.filename || '',
      // Ne pas définir 'estApprouve' ici pour laisser le service définir 'pending' par défaut
    };

    if (!files || files.length === 0) {
      throw new BadRequestException('Image is required');
    }

    const user = await this.magasinService.checkUserExistence(dto.proprietaireId);
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }

    return this.magasinService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stores' })
  @ApiResponse({ status: 200, description: 'Retrieve all stores.' })
  findAll(@Query('estApprouve') estApprouve?: MagasinStatus) {
    return this.magasinService.findAll(estApprouve);
  }

  @Get(':idMagasin')
  @ApiOperation({ summary: 'Get a store by ID' })
  @ApiResponse({ status: 200, description: 'Retrieve a store by ID.' })
  @ApiResponse({ status: 404, description: 'Store not found.' })
  findOne(@Param('idMagasin') idMagasin: number) {
    return this.magasinService.findOne(+idMagasin);
  }

  @Put(':idMagasin')
  @UseInterceptors(AnyFilesInterceptor(multerOptions))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a store by ID' })
  @ApiResponse({ status: 200, description: 'Store updated successfully.' })
  @ApiResponse({ status: 404, description: 'Store not found.' })
  async update(
    @Param('idMagasin') idMagasin: number,
    @Body() formData: any, // Changer le type de 'dto' à 'formData: any'
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const updateDto: UpdateMagasinDto = {
      nom: formData.nom,
      description: formData.description,
      localisation: formData.localisation,
      horaire: formData.horaire,
      telephone: formData.telephone,
      ville: formData.ville,
      // Convertir la chaîne en enum si 'estApprouve' est présent
      estApprouve: formData.estApprouve ? (formData.estApprouve as MagasinStatus) : undefined,
    };

    if (files && files.length > 0) {
      updateDto.image = files[0].filename;
    }
    return this.magasinService.update(idMagasin, updateDto);
  }

  @Delete(':idMagasin')
  @ApiOperation({ summary: 'Delete a store by ID' })
  @ApiResponse({ status: 200, description: 'Store deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Store not found.' })
  remove(@Param('idMagasin') idMagasin: number) {
    return this.magasinService.remove(+idMagasin);
  }

  @Patch(':idMagasin/approve')
  @ApiOperation({ summary: 'Approve a store' })
  @ApiResponse({ status: 200, description: 'Store approved successfully.' })
  @ApiResponse({ status: 404, description: 'Store not found.' })
  approveStore(@Param('idMagasin') idMagasin: number) {
    return this.magasinService.approveStore(+idMagasin);
  }

  @Patch(':idMagasin/reject')
  @ApiOperation({ summary: 'Reject a store' })
  @ApiResponse({ status: 200, description: 'Store rejected successfully.' })
  @ApiResponse({ status: 404, description: 'Store not found.' })
  rejectStore(@Param('idMagasin') idMagasin: number) {
    return this.magasinService.rejectStore(+idMagasin);
  }

  // Dans store.controller.ts
@Get('status/:status')
@ApiOperation({ summary: 'Get stores by status' })
@ApiResponse({ status: 200, description: 'Retrieve stores by status.' })
findByStatus(@Param('status') status: MagasinStatus) {
  return this.magasinService.findByStatus(status);
}
}