// bard app/src backend/temoignage/temoignage.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemoignageService } from './services/services/temoignage.service';
import { TemoignageController } from './controllers/temoignage.controller';
import { Temoignage } from './entities/temoignage.entity';
import { User } from '../user/entities/user.entity'; 
import { UserModule } from '../user/user.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Temoignage, User]),
    UserModule,
  ],
  providers: [TemoignageService],
  controllers: [TemoignageController],
  exports: [TemoignageService], // Exporter le service si d'autres modules en ont besoin
})
export class TemoignageModule {}