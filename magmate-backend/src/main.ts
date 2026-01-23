import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 1. Préfixe API (Très important pour ne pas conflire avec les routes Angular)
  app.setGlobalPrefix('api');
  
  // 2. Configuration CORS dynamique
  // En local, on utilise 4200. En prod, on lira la variable d'environnement ou on autorisera tout si même domaine.
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
  
  app.enableCors({
    origin: frontendUrl, // Utilise la variable d'env
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  app.useGlobalPipes(new ValidationPipe());

  // Support des payloads volumineux
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Swagger (Accessible via /api/docs)
  const config = new DocumentBuilder()
    .setTitle('API de Magmate')
    .setDescription("La documentation de l'API")
    .setVersion('1.0')
    .addTag('magasins')
    .addTag('produits')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Le port aussi peut être dynamique (Render/Heroku/Railway utilisent process.env.PORT)
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}/api`);
}
bootstrap();