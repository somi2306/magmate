import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  Delete,
  Put,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { CreateProduitDto } from '../dto/create-produit.dto/create-produit.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { UpdateProduitDto } from '../dto/update-produit.dto/update-produit.dto';

@ApiTags('produits')
@Controller('produits')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imagePrincipale', maxCount: 1 },
      { name: 'images', maxCount: 10 },
    ])
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new product' })
  async create(
    @Body() formData: any, 
    @UploadedFiles()
    files: {
      imagePrincipale?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    // CORRECTION : Validation de l'ID magasin
    if (!formData.magasinIdMagasin) {
      throw new BadRequestException("L'ID du magasin est obligatoire");
    }

    const dto: CreateProduitDto = {
      titre: formData.titre,
      description: formData.description,
      prix: formData.prix ? parseFloat(formData.prix) : 0,
      magasinIdMagasin: parseInt(formData.magasinIdMagasin, 10), // Conversion sûre
      imagePrincipale: '', 
      images: [], 
    };

    const mainImage = files?.imagePrincipale?.[0];
    const galleryImages = files?.images;

    if (!mainImage) {
      throw new BadRequestException('Une image principale est requise');
    }

    return this.productService.create(dto, mainImage, galleryImages);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products with optional search and filter' })
  async findAll(
    @Query('search') search?: string,
    @Query('ville') ville?: string,
  ) {
    return this.productService.findAll(search, ville);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get total product count' })
  async getProductCount() {
    return this.productService.getProductCount();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  async findOne(@Param('id') id: number) {
    return this.productService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product by ID' })
  async remove(@Param('id') id: number) {
    return this.productService.remove(id);
  }

  @Put(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imagePrincipale', maxCount: 1 },
      { name: 'images', maxCount: 10 },
    ])
  )
  @ApiConsumes('multipart/form-data')
  async update(
    @Param('id') id: number,
    @Body() formData: any,
    @UploadedFiles()
    files: {
      imagePrincipale?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    const dto: UpdateProduitDto = {
      titre: formData.titre,
      description: formData.description,
      prix: formData.prix ? parseFloat(formData.prix) : undefined,
      magasinIdMagasin: formData.magasinIdMagasin ? parseInt(formData.magasinIdMagasin, 10) : undefined,
    };

    const mainImage = files?.imagePrincipale?.[0];
    const galleryImages = files?.images;

    return this.productService.update(+id, dto, mainImage, galleryImages);
  }

  @Get('stats/by-store')
  @ApiOperation({ summary: 'Get product count by store' })
  async getProductCountByStore() {
    return this.productService.getProductCountByStore();
  }
}