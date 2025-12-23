import { PrismaModule } from './prisma/prisma.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PropertyModule } from './property/property.module';

import { ConfigModule } from '@nestjs/config';
import jwtConfig from './modules/auth/common/config/jwt.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RedisModule } from './redis/redis.module';
import { SessionService } from './session/session.service';
import { RapoarteModule } from './modules/comenzi/rapoarte.module';

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
    RedisModule,
    RapoarteModule
  ],
  controllers: [AppController],
  providers: [AppService,SessionService],
})
export class AppModule {}
