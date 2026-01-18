// bard app/src backend/temoignage/temoignage.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemoignageService } from './services/services/temoignage.service';
import { TemoignageController } from './controllers/temoignage.controller';
import { Temoignage } from './entities/temoignage.entity';
import { User } from '../user/entities/user.entity'; // Importez l'entité User
import { UserModule } from '../user/user.module'; // Importez UserModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Temoignage, User]),
    UserModule, // Ajoutez cette ligne pour importer UserModule
  ],
  providers: [TemoignageService],
  controllers: [TemoignageController],
  exports: [TemoignageService], // Exporter le service si d'autres modules en ont besoin
})
export class TemoignageModule {}