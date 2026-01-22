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
  Query,
} from '@nestjs/common';
import { StoreService } from '../services/store.service';
import { CreateMagasinDto } from '../dto/create-magasin.dto/create-magasin.dto';
import { UpdateMagasinDto } from '../dto/update-magasin.dto/update-magasin.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { MagasinStatus } from '../entities/magasin.entity';

@ApiTags('magasins')
@Controller('magasins')
export class StoreController {
  constructor(private readonly magasinService: StoreService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() formData: any,
  ) {
    const dto: CreateMagasinDto = {
      nom: formData.nom,
      description: formData.description,
      localisation: formData.localisation,
      horaire: formData.horaire,
      telephone: formData.telephone,
      ville: formData.ville,
      proprietaireId: formData.proprietaireId,
      image: '', 
    };

    const imageFile = files && files.length > 0 ? files[0] : undefined;

    return this.magasinService.create(dto, imageFile);
  }

  @Get()
  @ApiOperation({ summary: 'Get all stores' })
  findAll(@Query('estApprouve') estApprouve?: MagasinStatus) {
    return this.magasinService.findAll(estApprouve);
  }

  @Get(':idMagasin')
  @ApiOperation({ summary: 'Get a store by ID' })
  findOne(@Param('idMagasin') idMagasin: number) {
    return this.magasinService.findOne(+idMagasin);
  }

  @Put(':idMagasin')
  @UseInterceptors(AnyFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update a store by ID' })
  async update(
    @Param('idMagasin') idMagasin: number,
    @Body() formData: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const updateDto: UpdateMagasinDto = {
      nom: formData.nom,
      description: formData.description,
      localisation: formData.localisation,
      horaire: formData.horaire,
      telephone: formData.telephone,
      ville: formData.ville,
      estApprouve: formData.estApprouve ? (formData.estApprouve as MagasinStatus) : undefined,
    };

    const imageFile = files && files.length > 0 ? files[0] : undefined;
    
    return this.magasinService.update(+idMagasin, updateDto, imageFile);
  }

  @Delete(':idMagasin')
  @ApiOperation({ summary: 'Delete a store by ID' })
  remove(@Param('idMagasin') idMagasin: number) {
    return this.magasinService.remove(+idMagasin);
  }

  @Patch(':idMagasin/approve')
  @ApiOperation({ summary: 'Approve a store' })
  approveStore(@Param('idMagasin') idMagasin: number) {
    return this.magasinService.approveStore(+idMagasin);
  }

  @Patch(':idMagasin/reject')
  @ApiOperation({ summary: 'Reject a store' })
  rejectStore(@Param('idMagasin') idMagasin: number) {
    return this.magasinService.rejectStore(+idMagasin);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get stores by status' })
  findByStatus(@Param('status') status: MagasinStatus) {
    return this.magasinService.findByStatus(status);
  }

  @Get('stats/by-status')
  async getMagasinCountByStatus() {
    return this.magasinService.getMagasinCountByStatus();
  }
}