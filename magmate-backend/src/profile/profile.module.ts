import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CloudinaryModule
  ],
  providers: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}