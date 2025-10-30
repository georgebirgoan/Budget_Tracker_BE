import { Module } from '@nestjs/common';
import { AuthService } from './login.service';
import { AuthController } from '../login/auth.controller';
import { UserService } from 'src/modules/auth/register/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { LocalStrategy } from '../common/strategies/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '../common/config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from '../common/strategies/jwt.strategy';
import refreshJwtConfig from '../common/config/refresh-jwt.config';
import { RefreshJwtStrategy } from '../common/strategies/refresh.strategy';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from '../common/guards/roles/roles.guard';
import googleOauthConfig from '../common/config/google-oauth.config';
import { GoogleStrategy } from '../common/strategies/google.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    ConfigModule.forFeature(refreshJwtConfig),
    ConfigModule.forFeature(googleOauthConfig),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    LocalStrategy,
    JwtStrategy,
    RefreshJwtStrategy,
    GoogleStrategy,
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard, //@UseGuards(JwtAuthGuard) applied on all API endppints
    // },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AuthModule {}
