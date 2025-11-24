import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';



async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
  });
  
  console.log('🚀 NestJS backend starting...');
  (app as any).set('trust proxy', 1);

  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    transform: true,
  }));

   
      // app.enableCors({
      //   origin: [
      //     "https://dasmar-fe.onrender.com"     // PROD FRONT eu
      //   ],
      //   methods: "GET,POST,PATCH,DELETE,OPTIONS",
      //   credentials: true,
      //   allowedHeaders: "Content-Type, Authorization",
      // });

      app.enableCors({
  origin: (origin, cb) => {
    const allowed = [
      "http://localhost:3000",
      "https://dasmar-fe.onrender.com", 
    ];

    // Permite TOATE subdomeniile *.onrender.com ale frontendului
    if (!origin || allowed.includes(origin) || /https:\/\/dasmar-fe.*\.onrender\.com$/.test(origin)) {
      cb(null, true);
    } else {
      cb(new Error("CORS blocked: " + origin));
    }
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

  //  Swagger UI at http://localhost:3000/api
  SwaggerModule.setup('api', app, document);

  await app.listen(8000,'0.0.0.0');
  console.log('✅\n Server running on http://localhost:8000');
}
bootstrap();
