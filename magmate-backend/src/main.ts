import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.enableCors();

  app.useGlobalPipes(new ValidationPipe());

  // Support des payloads volumineux (nécessaire pour l'upload avant envoi Cloudinary)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('API de Magmate')
    .setDescription("La documentation de l'API pour gérer les magasins et produits")
    .setVersion('1.0')
    .addTag('magasins')
    .addTag('produits')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();