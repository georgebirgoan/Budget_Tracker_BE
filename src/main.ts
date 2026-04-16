import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { GlobalExceptionFilter } from './modules/auth/helper/error-function';
import { JwtAuthGuard } from './modules/auth/common/guards/jwt-auth/jwt-auth.guard';


async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
  });
  
  console.log('🚀 NestJS backend starting...');
  app.use(cookieParser());
 

  //validare GLOBALA DTO
  app.useGlobalPipes(new ValidationPipe({
    whitelist:true,
    forbidNonWhitelisted:true
  }))

      app.enableCors({
        origin: (origin, callback) => {
          const allowedOrigins = [
           'http://localhost:8081',
            'http://172.20.10.9:8081'
          ];

          if (!origin) {
            return callback(null, true);
          }

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        if (/^https:\/\/.*dasmar-fe\.onrender\.com$/.test(origin)) {
          return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
});


   const config = new DocumentBuilder()
    .setTitle('Budget Tracker API')                
    .setDescription('API documentation for Budget Tracker system')
    .setVersion('1.0')
    .addBearerAuth()                            
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  
  console.log('PORTT INAINTE ',Number(process.env.PORT) || 8000)
  const port = Number(process.env.PORT) || 8000; 


  await app.listen(port,'0.0.0.0');
  console.log(`\n------ Server running on port:${port}`);
}
bootstrap();
