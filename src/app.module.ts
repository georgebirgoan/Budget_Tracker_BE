import { PrismaModule } from './prisma/prisma.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PropertyModule } from './property/property.module';

import { ConfigModule } from '@nestjs/config';
import jwtConfig from './modules/auth/common/config/jwt.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RapoarteModule } from './modules/transaction/rapoarte.module';
import { PlanModule } from './modules/plan/plan.module';

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
    UsersModule,
    RapoarteModule,
    PlanModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
