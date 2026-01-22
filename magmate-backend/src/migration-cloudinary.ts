import 'reflect-metadata'; 
import { DataSource } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// --- IMPORT DE TOUTES LES ENTITÉS ---
import { User } from './user/entities/user.entity';
import { UserRequestEntity } from './user/entities/userrequest.entity';
import { Event } from './events/entities/event.entity';
import { Favorite } from './events/entities/favorite.entity';
import { Magasin } from './marketplace/entities/magasin.entity';
import { Produit } from './marketplace/entities/produit.entity';
import { Reclamation } from './marketplace/entities/reclamation.entity';
import { Image } from './marketplace/entities/image.entity';
import { Avis } from './marketplace/entities/avis.entity';
import { Prestataire } from './prestataire/entities/prestataire.entity';
import { Reclamationprestataire } from './prestataire/entities/reclamationprestataire.entity';
import { avisprestataire } from './prestataire/entities/avisprestataire.entity';
import { ConversationEntity } from './messagerie/models/conversation.entity';
import { MessageEntity } from './messagerie/models/message.entity';
import { ActiveConversationEntity } from './messagerie/models/active-conversation.entity';
import { Temoignage } from './temoignage/entities/temoignage.entity';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'aws-0-eu-west-3.pooler.supabase.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'postgres',
  entities: [
    User,
    UserRequestEntity,
    Event,
    Favorite,
    Magasin,
    Produit,
    Reclamation,
    Image,
    Avis,
    Prestataire,
    Reclamationprestataire,
    avisprestataire,
    ConversationEntity,
    MessageEntity,
    ActiveConversationEntity,
    Temoignage
  ],
  synchronize: false,
});

async function uploadToCloudinary(localPath: string): Promise<string | null> {
  if (!localPath) return null;
  
  const cleanPath = localPath.startsWith('/') ? localPath.slice(1) : localPath;
  
  // Chemins possibles
  let absolutePath = path.resolve(__dirname, '../', cleanPath); 
  if (!fs.existsSync(absolutePath)) {
      absolutePath = path.resolve(__dirname, '../uploads', cleanPath);
  }
  if (!fs.existsSync(absolutePath)) {
      absolutePath = path.resolve(__dirname, '../public', cleanPath);
  }
  // Cas spécifique pour les réclamations dans public/reclamations
  if (!fs.existsSync(absolutePath)) {
      absolutePath = path.resolve(__dirname, '../public/reclamations', path.basename(cleanPath));
  }

  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ Fichier introuvable localement : ${cleanPath}`);
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(absolutePath, {
      folder: 'magmate_migration',
    });
    return result.secure_url;
  } catch (error) {
    console.error(`❌ Erreur upload Cloudinary pour ${cleanPath}:`, error.message);
    return null;
  }
}

async function runMigration() {
  await AppDataSource.initialize();
  console.log('📦 Connexion Base de données établie');

  // 1. MIGRATION USER (Photo)
  console.log('--- Migration Users ---');
  const userRepository = AppDataSource.getRepository(User);
  const users = await userRepository.find({
      select: { id: true, email: true, photo: true },
      loadEagerRelations: false // Important : ne pas charger les relations automatiquement
  });

  for (const user of users) {
    if (user.photo && !user.photo.startsWith('http')) {
      console.log(`User ${user.email}`);
      const newUrl = await uploadToCloudinary(user.photo);
      if (newUrl) { 
          await userRepository.update(user.id, { photo: newUrl }); 
      }
    }
  }

  // 2. MIGRATION EVENTS (ImageUrl)
  console.log('--- Migration Events ---');
  const eventRepository = AppDataSource.getRepository(Event);
  const events = await eventRepository.find({ loadEagerRelations: false });
  for (const event of events) {
    if (event.imageUrl && !event.imageUrl.startsWith('http')) {
      console.log(`Event ${event.title}`);
      const newUrl = await uploadToCloudinary(event.imageUrl);
      if (newUrl) { 
          await eventRepository.update(event.id, { imageUrl: newUrl }); 
      }
    }
  }

  // 3. MIGRATION MAGASINS (Image)
  console.log('--- Migration Magasins ---');
  const magasinRepository = AppDataSource.getRepository(Magasin);
  const magasins = await magasinRepository.find({ loadEagerRelations: false });
  for (const mag of magasins) {
    if (mag.image && !mag.image.startsWith('http')) {
      console.log(`Magasin ${mag.nom}`);
      const newUrl = await uploadToCloudinary(mag.image);
      if (newUrl) { 
          await magasinRepository.update(mag.idMagasin, { image: newUrl });
      }
    }
  }

  // 4. MIGRATION PRODUITS (ImagePrincipale + Galerie)
  console.log('--- Migration Produits ---');
  const produitRepository = AppDataSource.getRepository(Produit);
  const imageRepository = AppDataSource.getRepository(Image);
  const produits = await produitRepository.find({ 
      relations: ['images'],
      loadEagerRelations: false // On charge 'images' manuellement via 'relations', on ignore le reste
  });

  for (const prod of produits) {
    // Image Principale
    if (prod.imagePrincipale && !prod.imagePrincipale.startsWith('http')) {
      console.log(`Produit Main ${prod.titre}`);
      const newUrl = await uploadToCloudinary(prod.imagePrincipale);
      if (newUrl) { 
          await produitRepository.update(prod.idProduit, { imagePrincipale: newUrl });
      }
    }

    // Galerie (Entité Image)
    if (prod.images && prod.images.length > 0) {
      for (const imgEntity of prod.images) {
        if (imgEntity.imageURL && !imgEntity.imageURL.startsWith('http')) {
          console.log(`Produit Galerie ID ${imgEntity.idImage}`);
          const newUrl = await uploadToCloudinary(imgEntity.imageURL);
          if (newUrl) { 
             await imageRepository.update(imgEntity.idImage, { imageURL: newUrl }); 
          }
        }
      }
    }
  }

  // 5. MIGRATION RECLAMATIONS (Marketplace)
  console.log('--- Migration Réclamations ---');
  const reclamationRepo = AppDataSource.getRepository(Reclamation);
  const reclamations = await reclamationRepo.find({ loadEagerRelations: false });
  for (const rec of reclamations) {
    if (rec.pieceJointe && !rec.pieceJointe.startsWith('http')) {
      console.log(`Reclamation ID ${rec.idReclamation}`);
      const newUrl = await uploadToCloudinary(rec.pieceJointe);
      if (newUrl) { 
          await reclamationRepo.update(rec.idReclamation, { pieceJointe: newUrl });
      }
    }
  }

  // 6. MIGRATION RECLAMATIONS PRESTATAIRE
  console.log('--- Migration Réclamations Prestataire ---');
  const recPrestataireRepo = AppDataSource.getRepository(Reclamationprestataire);
  
  // CORRECTION : loadEagerRelations: false est CRUCIAL ici car l'entité a eager: true sur Utilisateur
  const recPrestas = await recPrestataireRepo.find({
      select: {
          idReclamation: true,
          pieceJointe: true
      },
      loadEagerRelations: false 
  });

  for (const rec of recPrestas) {
    if (rec.pieceJointe && !rec.pieceJointe.startsWith('http')) {
      console.log(`Reclamation Presta ID ${rec.idReclamation}`);
      const newUrl = await uploadToCloudinary(rec.pieceJointe);
      if (newUrl) { 
          await recPrestataireRepo.update(rec.idReclamation, { pieceJointe: newUrl });
      }
    }
  }

  console.log('🎉 MIGRATION TERMINÉE !');
  process.exit(0);
}

runMigration().catch((error) => {
  console.error('Erreur fatale migration:', error);
  process.exit(1);
});