import { PrismaModule } from './prisma/prisma.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PropertyModule } from './property/property.module';

import { ConfigModule } from '@nestjs/config';
import { RegisterModule } from './modules/auth/register/register.module';
import {  LoginModule } from './modules/auth/login/login.module';
import jwtConfig from './modules/auth/common/config/jwt.config';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
      expandVariables: true,
    }),
    PrismaModule,
    PropertyModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
