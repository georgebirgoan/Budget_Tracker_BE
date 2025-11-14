import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';



async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
  });
  console.log('🚀 NestJS backend starting...');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // remove unknown properties
    // forbidNonWhitelisted: true, // throw error on extra fields
    transform: true, // automatically transform payloads to DTO classes
  }));

  
  
  app.enableCors({
    origin: 'https://dasmar-fe-ctct.vercel.app/',
    methods: 'GET,POST,PATCH,DELETE,OPTIONS',
  });

   const config = new DocumentBuilder()
    .setTitle('Budget Tracker API')                 // Your project title
    .setDescription('API documentation for Budget Tracker system') // Description
    .setVersion('1.0')
    .addBearerAuth()                                // ✅ Adds "Authorize" button for JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Expose Swagger UI at http://localhost:3000/api
  SwaggerModule.setup('api', app, document);

  await app.listen(8000,'0.0.0.0');
  console.log('✅\n Server running on http://localhost:8000');
}
bootstrap();
