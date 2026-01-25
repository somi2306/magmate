import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { FirebaseAdminModule } from './firebase/firebase-admin.module';
import { ProfileModule } from './profile/profile.module';
import { EventsModule } from './events/events.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { MessagerieModule } from './messagerie/messagerie.module';
import { PrestataireModule } from './prestataire/prestataire.module';
import { MailModule } from './mail/mail.module';
import { TemoignageModule } from './temoignage/temoignage.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ConfigModule } from '@nestjs/config'; 

@Module({
  imports: [
    // Charge les variables d'environnement (.env) globalement
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      // Dans Docker,il sera à la racine /app.
      rootPath: join(process.cwd(), 'static'), 
      //exclude: ['/api/:any(.*)'],
    }),

    DatabaseModule,
    AuthModule,
    UserModule,
    FirebaseAdminModule,
    ProfileModule,
    EventsModule,
    MarketplaceModule,
    MessagerieModule,
    PrestataireModule,
    MailModule,
    TemoignageModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}