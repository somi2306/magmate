import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';

// Entités
import { Produit } from './entities/produit.entity';
import { Magasin } from './entities/magasin.entity';
import { Reclamation } from './entities/reclamation.entity';
import { Avis } from './entities/avis.entity';
import { User } from 'src/user/entities/user.entity';
import { Image } from './entities/image.entity';

// Controllers (Unifiés)
import { MagasinController } from './controllers/MagasinController';
import { CommentController } from './controllers/comment.controller';
import { ReclamationController } from './controllers/reclamation.controller';
import { ProductController } from './controllers/product.controller'; 
import { StoreController } from './controllers/store.controller';
import { ImageController } from './controllers/image.controller';

// Services (Unifiés)
import { MagasinService } from './services/MagasinService';
import { CommentService } from './services/comment.service';
import { ReclamationService } from './services/reclamation.service';
import { StoreService } from './services/store.service';
import { ImageService } from './services/image.service';
import { ProductService } from './services/product.service'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Produit,
      Reclamation,
      Avis,
      Magasin,
      User,
      Image,
    ]),
    MulterModule.register(), // Mémoire par défaut pour Cloudinary
  ],
  controllers: [
    MagasinController,
    CommentController,
    ReclamationController,
    ProductController, 
    StoreController,
    ImageController,
  ],
  providers: [
    MagasinService,
    ProductService, 
    CommentService,
    ReclamationService,
    StoreService,
    ImageService,
  ],
  exports: [ProductService, StoreService],
})
export class MarketplaceModule {}