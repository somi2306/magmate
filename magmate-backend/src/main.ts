import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // --- MODIFICATION 1 : Ajouter le préfixe global ---
  app.setGlobalPrefix('api');
  
  // Configuration CORS (autoriser Angular)
  app.enableCors({
    origin: 'http://localhost:4200', // Recommandé de préciser l'origine
    credentials: true
  });

  app.useGlobalPipes(new ValidationPipe());

  // Support des payloads volumineux
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('API de Magmate')
    .setDescription("La documentation de l'API")
    .setVersion('1.0')
    .addTag('magasins')
    .addTag('produits')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // --- MODIFICATION 2 : Déplacer la doc sur 'api/docs' ---
  // Comme 'api' est maintenant le préfixe de tout, il vaut mieux mettre la doc sur un sous-chemin
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}/api`);
}
bootstrap();