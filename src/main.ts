import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';


async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
      bodyParser:false,
  });
  console.log('🚀 NestJS backend starting...');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // remove unknown properties
    forbidNonWhitelisted: true, // throw error on extra fields
    transform: true, // automatically transform payloads to DTO classes
  }));

  
  app.enableCors({
    origin: '*',
    methods: 'GET,POST,PATCH,DELETE,OPTIONS',
  });
  
  await app.listen(3000,'0.0.0.0');
  console.log('✅\n Server running on http://localhost:3000');
}
bootstrap();
