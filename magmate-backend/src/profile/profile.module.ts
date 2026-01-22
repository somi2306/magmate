import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module'; // 1. Import

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CloudinaryModule // 2. Ajout ici
  ],
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}